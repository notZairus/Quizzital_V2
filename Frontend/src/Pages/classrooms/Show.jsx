
import Heading1 from "../../Components/Heading1";
import { useNavigate, useParams } from "react-router-dom";
import { useContext, useRef, useState, useEffect, lazy } from "react";
import { ClassroomContext } from "../../contexts/ClassroomContext.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import Swal from "sweetalert2";
import { backendUrl, formatSeconds } from "../../js/functions.js";
import Toast from "../../Components/Toast.js";
import Button from '../../Components/Button.jsx';
import plus_icon from '../../assets/icons/plus-svgrepo-com.svg'

const ActivityPanel = lazy(() => import('../../Components/ActivityPanel.jsx'));


export default function ClassroomShow() {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const { classrooms, insertClassroom, refreshClassroom } = useContext(ClassroomContext);
  const [currentClassroom, setCurrentClassroom] = useState(classrooms.find(classroom => classroom.id == id));
  const navigate = useNavigate();
  const [showCreateActivityPanel, setShowCreateActivityPanel] = useState(false);
  const [isProf, setIsProf] = useState(currentUser.role == 'professor');
  const fileInputRef = useRef(null);
  const [activityRecords, setActivityRecords] = useState(null);


  function openActivity(_id) {
    isProf 
    ? showActivity()
    : answerActivity()

    async function showActivity() {
      let activity = currentClassroom.activities.find(act => act.id === _id)

      // if (!activity.quiz) {
      //   Swal.fire({
      //     icon: 'info',
      //     title: "This Activity has no assigned Questionnaire",
      //     text: 'Please assign a questionnaire'
      //   })
      //   return;
      // }

      navigate(`/classroom/${currentClassroom.id}/activity/${_id}/data`)
    }

    async function answerActivity() {
      let currentActivity = currentClassroom.activities.find(act => act.id == _id);

      if (!currentActivity.quiz) {
        Swal.fire({
          icon: 'info',
          title: 'Access Denied',
          text: 'The questionnaire for this quiz was deleted.',
          footer: 'Wait for your professor to assign new questionnaire for this quiz'
        })
        return;
      }

      let students_who_already_answered = currentActivity.records.map((r) => r.user_id);
      if (students_who_already_answered.includes(currentUser.id)) {

        if (!currentActivity.allow_review) {
          Swal.fire({
            icon: 'warning',
            title: 'Review Not Allowed',
            html: `
              <p style="font-size: 16px; margin: 0;">
                <b>Reviewing this activity is not allowed.</b>
              </p>
              <p style="font-size: 14px; color: #666;">
                Please contact your instructor if you believe this is a mistake.
              </p>
            `,
            confirmButtonText: 'Okay',
            allowOutsideClick: false
          });
          return;
        }

        Swal.fire({
          icon: 'question',
          title: 'Quiz Already Submitted',
          html: `
            <p>You have already submitted this quiz.</p>
            <p><b>Would you like to review your answers?</b></p>
          `,
          showCancelButton: true,
          confirmButtonText: 'Review Quiz',
          cancelButtonText: 'Cancel',
          footer: 'If you believe this is an error, please contact your instructor.',
          allowOutsideClick: false,
          preConfirm: () => {
            localStorage.setItem('currentClassroomId', currentClassroom.id);
            navigate(`/activity/${currentActivity.id}/review`)
          }
        });
        return;
      }

      let timeNow = new Date();
      let openTime = new Date(currentActivity.open_at);
      let closeTime = currentActivity.close_at ? new Date(currentActivity.close_at) : null;

      if (timeNow.getTime() < openTime.getTime()) {
        Swal.fire({
          icon: 'info',
          title: 'Quiz Not Yet Started',
          html: `
            <p>The quiz will be open starting:</p>
            <b>${openTime.toLocaleString()}</b>
          `,
          confirmButtonText: 'Okay',
          footer: 'Please come back once it opens.',
          allowOutsideClick: false
        });
        return;
      }

      if (closeTime && timeNow.getTime() > closeTime.getTime()) {
        Swal.fire({
          icon: 'warning',
          title: 'Quiz Ended',
          html: `
            <p>Sorry, this quiz closed on:</p>
            <b>${closeTime.toLocaleString()}</b>
          `,
          confirmButtonText: 'Got it',
          footer: 'You can no longer participate in this quiz.',
          allowOutsideClick: false
        });
        return;
      }
      
      localStorage.setItem('activity', JSON.stringify(currentActivity));
      localStorage.setItem('currentClassroom', JSON.stringify(currentClassroom));
      navigate('/activity-area');
    }
  }

  async function uploadMaterial() {
    let fileInput = fileInputRef.current;

    return new Promise(resolve => {
      fileInput.addEventListener('change', (event) => {
        let file = event.target.files[0];
        if (file) resolve(file);
      });
      fileInput.click();
    })
  }

  async function handleFileUpload() {
    try {
      let selectedFile = await uploadMaterial();
      let formData = new FormData();

      formData.append('file', selectedFile)
      formData.append("upload_preset", "my_unsigned_preset");

      const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUDNAME}/raw/upload`, {
          method: "POST",
          body: formData
      });
      const data = await response.json();

      const response2 = await fetch(backendUrl('/learning-material'), {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          'classroom_id': currentClassroom.id,
          'file_name': selectedFile.name,
          'link': data.secure_url
        })
      })
      
      refreshClassroom();
      Toast("success", "Quiz created!", 1000);

    } catch (error) {
      console.error("Upload failed:", error);
    }
  }

  
  async function handleReviewToggle(e, activity_id) {
    e.stopPropagation();
    let toggledActivity = currentClassroom.activities.find(act => act.id === activity_id)

    let res = await fetch(backendUrl('/activity'), {
      method: 'PATCH', 
      headers: {
        'Content-type' : 'application/json'
      },
      body: JSON.stringify({
        'activity_id': toggledActivity.id,
        'value': !toggledActivity.allow_review
      })
    })

    if (res.ok) {
      refreshClassroom()
    }
  }

  async function acceptRequest(student_id) {
    let res = await fetch(backendUrl('/classroom-request'), {
      method: 'PATCH',
      headers: {
        'Content-type' : 'application/json',
      },
      body: JSON.stringify({
        'student_id': student_id,
        'classroom_id': currentClassroom.id
      })
    })

    let result = await res.json()

    if (result.status === 200) {
      let updated_students = currentClassroom.students.map(std => std.id == student_id ? {...std, status: 'accepted'} : std);
      setCurrentClassroom({...currentClassroom, students: updated_students})
      insertClassroom(classrooms.map((c) => c.id == currentClassroom.id ? {...currentClassroom, students: updated_students} : c));
    }
  }

  async function declineRequest(student_id) {
    let res = await fetch(backendUrl('/classroom-request'), {
      method: 'DELETE',
      headers: {
        'Content-type' : 'application/json',
      },
      body: JSON.stringify({
        'student_id': student_id,
        'classroom_id': currentClassroom.id
      })
    })

    let result = await res.json()

    if (result.status === 200) {
      let updated_students = currentClassroom.students.filter(std => std.id != student_id);
      setCurrentClassroom({...currentClassroom, students: updated_students})
      insertClassroom(classrooms.map((c) => c.id == currentClassroom.id ? {...currentClassroom, students: updated_students} : c));
    }
  }

  async function kickStudent(student_id) {
    let student = currentClassroom.students.find(s => s.id === student_id);

    // to be implemented
    Swal.fire({
      icon: 'warning',
      title: `Remove ${student.first_name}?`,
      text: "Are you sure you want to remove this student?",
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Remove!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        
        await fetch(backendUrl('/classroom-request'), {
          method: 'DELETE',
          headers: {
            'Content-type' : 'application/json'
          },
          body: JSON.stringify({
            'student_id': student_id,
            'classroom_id': currentClassroom.id
          })
        })

        // await fetch(backendUrl('/activity-record'), {
        //   method: 'DELETE',
        //   headers: {
        //     'Content-type' : 'application/json'
        //   },
        //   body: JSON.stringify({
        //     'user_id': student_id,
        //     'classroom_id': currentClassroom.id
        //   })
        // })

        refreshClassroom();
        Swal.fire('Removeed!', `${student.first_name} has been removed.`, 'success');
      }
    });

    return;
  }


  useEffect(() => {
    setCurrentClassroom(classrooms.find(classroom => classroom.id == id))
  }, [classrooms])

  useEffect(() => {
    if (!currentClassroom) return;

    let allRecords = {};

    currentClassroom.students.forEach(std => {
      allRecords[`${std.last_name} ${std.first_name}`] = [`${std.last_name} ${std.first_name}`];
      currentClassroom.activities.forEach(act => {
        let student_record = act.records.find(_record => _record.user_id === std.id)
        allRecords[`${std.last_name} ${std.first_name}`].push(student_record ? student_record.user_score: 0);
      })
    })

    setActivityRecords(allRecords);
  }, [currentClassroom, classrooms]);


  function recordTable() {
    if (!activityRecords) return;

    let records = Object.values(activityRecords);

    return (
      <>
        <h2 className="text-2xl font-semibold">Student Records</h2>
        <div class="overflow-x-auto rounded-lg mt-4">
          <table class="min-w-full table-auto bg-white border-collapse text-gray-700">
            <thead class="bg-gradient-to-r from-BackgroundColor_Darker to-BackgroundColor_Darkest text-white">
              <tr>
                <th class="px-6 py-3 text-center uppercase font-semibold">Student Name</th>
                {
                  currentClassroom.activities.map(act => (
                    <th class="px-6 py-3 uppercase font-semibold text-center">{act.name} ({act.perfect_score}%)</th>
                  ))
                }
              </tr>
            </thead>
            <tbody>
              {records.map((rec => (
                <tr class="border-b  hover:bg-BackgroundColor hover:text-black transition-all duration-300">
                  {
                    rec.map(data => (
                      <td class="px-6 py-4 text-lg text-center">{data.length >= 3 ? data : `${data}%`}</td>
                    ))
                  }
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  function deleteClassroom() {

    Swal.fire({
      title: 'Confirm Classroom Deletion',
      text: 'Please enter your password to confirm.',
      icon: 'warning',
      input: 'password',
      inputLabel: 'Password',
      inputPlaceholder: 'Enter your password',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      footer: '<span style="color: gray;">This action is irreversible.</span>',
      inputValidator: (value) => {
        if (!value) {
          return 'Password is required to proceed!';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const enteredPassword = result.value;

        if (enteredPassword != currentUser.password) {
          return;
        } 

        let res = await fetch(backendUrl('/classroom'), {
          method: 'DELETE',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            'classroom_id': currentClassroom.id
          })
        })

        if (!res.ok) {
          return;
        }
    
        // Optional: show loading
        Swal.fire({
          title: 'Deleting...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
    
        // Example of follow-up after successful password check
        // Replace this setTimeout with your actual AJAX/fetch call
        setTimeout(() => {
          Swal.fire(
            'Deleted!',
            'The classroom has been successfully deleted.',
            'success'
          );

          refreshClassroom();
          navigate('/classroom');
        }, 1500);
      }
    });
    
  }


  
  return (
    <>
      {isProf && (
        <ActivityPanel
          show={showCreateActivityPanel}
          setShow={setShowCreateActivityPanel}
          classroom_id={id}
        />
      )}


      <div className="flex justify-between items-start">
        <Heading1>
          <div className="text-2xl md:text-3xl font-semibold space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-blue-500 cursor-pointer hover:underline text-base md:text-lg"
                onClick={() => navigate('/classroom')}
              >
                Classroom &gt;
              </span>
              <span>{currentClassroom.name}</span>
              {isProf && (
                <span className="text-gray-400 text-sm md:text-base font-normal">
                  (Key: {currentClassroom.classroom_key})
                </span>
              )}
            </div>
          </div>
        </Heading1>

        {currentUser.role === "professor" && (
          <button 
            className="bg-red-500 hover:bg-red-600 transition text-lg px-6 py-3 text-white rounded-2xl font-semibold shadow-md"
            onClick={deleteClassroom} 
          >
            Delete
          </button>
        )}
      </div>


      {currentClassroom.description && (
        <p onClick={recordTable} className="mb-4 text-gray-600">{currentClassroom.description}</p>
      )}

      <hr className="mb-6 border-gray-300" />

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* STUDENT DIV */}
        {isProf && (
          <div className="lg:w-2/5 bg-white border rounded-lg shadow-sm p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Students</h2>
              <span className="text-gray-500 text-sm">
                Enrolled: {currentClassroom.students.filter(s => s.status === "accepted").length}
              </span>
            </div>
            <div className="space-y-3 h-[580px] overflow-auto">
              {currentClassroom.students.map(student => (
                <div key={student.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                  <p className="font-medium">{student.first_name} {student.last_name}</p>
                  {student.status === 'pending' ? (
                    <div className="flex gap-3">
                      <button onClick={() => acceptRequest(student.id)} className="text-blue-500 hover:text-blue-700">Accept</button>
                      <button onClick={() => declineRequest(student.id)} className="text-red-500 hover:text-red-700">Decline</button>
                    </div>
                  ) : (
                    <button onClick={() => kickStudent(student.id)} className="text-red-500 hover:text-red-700">Remove</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RIGHT SIDE: Activities + Materials */}
        <div className="flex-1 flex flex-col gap-6">

          {/* ACTIVITY DIV */}
          <div className="bg-white border rounded-lg shadow-sm p-6 transition hover:shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Quizzes</h2>
              {isProf && (
                <Button onClick={() => setShowCreateActivityPanel(true)}>
                  <img src={plus_icon} alt="+" className="w-5" />
                  <span className="ml-1 font-medium">Create</span>
                </Button>
              )}
            </div>
            <div className="space-y-3 max-h-[380px] overflow-auto">
              {currentClassroom.activities.map(activity => (
                <div
                  key={activity.id}
                  onClick={() => openActivity(activity.id)}
                  className="w-full bg-gradient-to-r from-BackgroundColor_Darker to-BackgroundColor_Darkest rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  {console.log(activity)}
                  <div className="flex-1 flex justify-between items-center">
                    <div className="text-white font-semibold text-xl w-56 truncate">{activity.name}</div>
                  
                    <div className="text-sm text-white">
                      {activity.quiz ? (
                        <p className="text-lg">{activity.quiz.questions.length} Items</p>
                      ) : (
                        <p className="italic text-gray-300">No Questionnaire</p>
                      )}
                    </div>
                  
                    <div className="text-sm text-gray-200 text-right sm:text-left">
                      <p><span className="text-gray-300">Open:</span> {activity.open_at}</p>
                      <p><span className="text-gray-300">Close:</span> {activity.close_at ? activity.close_at : 'No Closing Date'}</p>
                      {activity.timer > 0 && (
                        <p><span className="text-gray-300">Timer:</span> {formatSeconds(activity.timer)} mins</p>
                      )}
                    </div>
                    {currentUser.role === "professor" && (
                      <div className="w-14 flex flex-col items-center gap-1">
                        <p className="text-sm text-white">Review?</p>
                        <div onClick={(e) => handleReviewToggle(e, activity.id)} className={`w-full h-7 rounded-full relative transition-all ${activity.allow_review ? "bg-BackgroundColor_Darker/60" : "bg-white"}`}>
                          <div className={`
                            h-full scale-90 aspect-square rounded-full bg-BackgroundColor_Darker absolute top-1/2 -translate-y-1/2 transition-all
                            ${activity.allow_review ? "right-0.5" : "left-0.5"}
                          `}></div> 
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LEARNING MATERIALS DIV */}
          <div className="bg-white border rounded-lg shadow-sm p-6 transition hover:shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Materials</h2>
              {isProf && (
                <>
                  <input type="file" ref={fileInputRef} className="hidden" />
                  <Button onClick={handleFileUpload}>
                    <img src={plus_icon} alt="+" className="w-5" />
                    <span className="ml-1 font-medium">Upload</span>
                  </Button>
                </>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentClassroom.learning_materials.map(material => (
                <a
                  key={material.id}
                  href={material.link}
                  target="_blank"
                  className="p-4 border rounded-lg bg-gradient-to-r from-BackgroundColor_Darker to-BackgroundColor_Darkest transition text-white flex items-center hover:scale-110"
                >
                  <p className="truncate">{material.file_name}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RECORD TABLE SECTION */}
      {isProf && (
        <div className="mt-8 bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition">
          {recordTable()}
        </div>
      )}
    </>

  )
}