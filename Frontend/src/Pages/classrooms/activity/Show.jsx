import { useNavigate, useParams } from "react-router-dom";
import Heading1 from "../../../Components/Heading1";
import { useContext, useEffect, useState } from "react";
import { ClassroomContext } from "../../../contexts/ClassroomContext";
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import bell_icon from "../../../assets/icons/bell-alt-svgrepo-com.svg";
import { backendUrl } from "../../../js/functions";
import Toast from "../../../Components/Toast";



export default function ShowActivity() {
  const navigate = useNavigate()
  const parameters = useParams();
  const [activity, setActivity] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const { classrooms } = useContext(ClassroomContext);
  const [selectedStudent, setSelectedStudent] = useState(null);


  useEffect(() => {
    let currentClassroom = classrooms.find(c => c.id == parameters.classroom_id);
    setActivity(currentClassroom.activities.find(act => act.id == parameters.activity_id));
    setClassroom({...currentClassroom, students: currentClassroom.students.filter(s => s.status === "accepted")});
  }, []);

  async function notifyStudent(student) {
    let res = await fetch(backendUrl('/send-notification'), {
      method: 'POST',
      headers: {
        'Content-type' : 'application/json',
      },
      body: JSON.stringify({
        'email': student.email
      })
    })

    let result = await res.json();
    
    if (result.status === 200) {
      Toast('success', 'Email sent successfully!')
    }
  }


  function Graph1() {
    if (!activity) return;

    ChartJS.register(ArcElement, Tooltip, Legend);

    let recordCount = activity?.records.length;
    let studentCount = classroom?.students.length;

    let data = {
      labels: [
        'Answered',
        'Not Answered'
      ],
      datasets: [{
        data: [recordCount, studentCount - recordCount],
        backgroundColor: [
          '#12B9D8',
          '#F0F5F9',
        ],
        hoverOffset: 4
      }]
    }

    return (
      <>
        <p className="text-center font-semibold text-lg">Number of Students Who Answered the Activity</p>
        <div className="w-full my-4">
          <Doughnut  
            data={data}
          />
        </div>
        <p className="text-center">{activity?.records.length} out of {classroom?.students.length} students answered this activity.</p>
      </>
    )
  }

  function Graph2() {
    if (!activity) return;

    ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

    const labels = [];
    for(let i = 0; i < activity.quiz.questions.length + 1; i++) {
      labels.push((i) / activity.quiz.questions.length * 100);
    }

    let scores = labels.map((l) => 0);
    activity.records.forEach((r) => {
      if (labels.includes(r.user_score)) {
        for (let i = 0; i < labels.length; i++) {
          if (labels[i] === r.user_score) {
            scores[i]++;
          }
        }
      }
    })

    let data = {
      // labels is the question number (1, 2, 3, 4, 5, ...)
      labels: labels.map(l => `${l}%`),
      datasets: [
        {
          label: "Number of Students",
          data: scores,
          backgroundColor: "#12B9D8",
          barThickness: 50,
        },
      ],
    };

    const options = {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Grade %",
            font: { weight: "bold", size: 16 },
          },
        },
        y: {
          title: {
            display: true,
            text: "Number of Students",
            font: { weight: "bold", size: 16 },
          },
          ticks: {
            stepSize: 1,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    };

    return (
      <>
        <p className="text-center font-semibold text-lg">Score Distribution</p>
        <div className="w-full my-4 px-4">
          <Bar data={data} options={options}/>
        </div>
      </>
    )
  }

  function Graph3() {
    if (!activity) return;

    let recordCount = activity.records.length;
    let passedCount = activity.records.filter((r) => r.remarks === "Passed!").length;
    
    return (
      <>
        <p className="text-center font-semibold text-lg">Passing Rate</p>
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-8xl text-BackgroundColor_Darker">{passedCount / recordCount * 100}%</p>
        </div>
      </>
    )
  }

  function studentList() {
    if (!activity) return;

    let studentIDsWithActivity = activity.records.map(r => r.user_id)
    let finishedStudents = classroom.students.filter(std => studentIDsWithActivity.includes(std.id)).sort((a, b) => a.last_name > b.last_name == true ? 1 : -1);
    let unfinishedStudents = classroom.students.filter(std => !studentIDsWithActivity.includes(std.id)).sort((a, b) => a.last_name > b.last_name == true ? 1 : -1);

    return (
      <>
        <div className="w-full h-full">
          <p className="text-center font-semibold text-lg">Students</p>
          <div className="w-full h-full flex items-start justify-between gap-4 mt-4">
            <div className="flex-1 h-20">
              <p>Finished Students: </p>
              <div className="mt-2 w-full space-y-2 max-h-64 overflow-auto cursor-pointer">
                {finishedStudents.map((s, index) => (
                  <div onClick={() => setSelectedStudent(s)} className="w-full px-4 py-3 border hover:border-BackgroundColor_Darker transition-all duration-300 rounded"> 
                    {s.last_name} {s.first_name}
                  </div>
                ))}
              </div>
            </div>
  
            <div className="flex-1">
              <p>Unfinished Students: </p>
              <div className="mt-2 w-full space-y-2 max-h-64 overflow-auto">
                {unfinishedStudents.map((s, index) => (
                  <div className="w-full px-4 py-2 border h-12 hover:border-BackgroundColor_Darker transition-all duration-300 rounded flex justify-between items-center"> 
                    <p>{s.last_name} {s.first_name}</p>
                    <div onClick={() => notifyStudent(s)} className="h-full aspect-square rounded cursor-pointer">
                      <img src={bell_icon} alt="bell_icon" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }   

  function Graph5() {
    if (!activity) return;

    if (!selectedStudent) {
      return (
        <>
          <div className="w-full h-full flex items-center justify-center">
            {!selectedStudent && <p className="text-3xl text-gray-400">Select a Student</p>}
          </div>
        </>
      )
    }

    let studentRecord = activity.records.find(r => r.user_id == selectedStudent.id);
    let numberOfCorrects = studentRecord.user_score / activity.perfect_score * activity.quiz.questions.length;


    return (
      <>
        <p className="text-center font-semibold text-lg">Student's Activity Result</p>
        <div className="w-full h-full grid grid-cols-2 grid-rows-7 gap-y-4 mt-4 px-8">
          <div className="bg-white border-r-2 col-span-1 row-span-3 px-4 py-2 flex flex-col">
            <div className="flex-1 flex flex-col gap-4 justify-center items-center">
              <p>Corrects</p>
              <p className="text-5xl text-BackgroundColor_Darker">{numberOfCorrects} / {activity.quiz.questions.length}</p>
            </div>
          </div>
          <div className="bg-white  col-span-1 row-span-3 px-4 py-2 flex flex-col">
            <div className="flex-1 flex flex-col gap-4 justify-center items-center">
              <p>Score</p>
              <p className="text-5xl text-BackgroundColor_Darker">{studentRecord.user_score}%</p>
            </div>
          </div>
          <div className="bg-white border-t-2 col-span-2 row-span-4 px-4 py-2 flex flex-col">
            <div className="flex-1 flex justify-center items-center">
              <p className="text-6xl font-semibold text-BackgroundColor_Darker">{studentRecord.remarks}</p>
            </div>
          </div>
        </div>
      </>
    )
  }


  return (
    <>
      <Heading1>
        <div className="cursor-pointer">
          <span onClick={() => navigate('/classroom')}>Classroom</span> &gt; <span onClick={() => navigate(`/classroom/${classroom.id}`)}>{classroom?.name}</span> &gt; <span>{activity?.name}</span>
        </div>
      </Heading1>
      
      <hr className="mb-8"/>

      <div className="w-full grid grid-cols-9 transition-all duration-300 gap-4 pb-2">

        <div className="w-full text-4xl flex items-center justify-center col-span-full h-20 bg-white shadow rounded-xl">
          <p className="font-semibold text-black/80">
            Activity Statistics
          </p>
        </div>
        
        <div className="w-full h-full bg-white col-span-2 rounded shadow hover:shadow-lg hover:scale-105 transition-all duration-300 p-4 flex flex-col items-center">
          {Graph1()}
        </div>

        <div className="w-full h-full bg-white col-span-5 rounded shadow hover:shadow-lg hover:scale-105 transition-all duration-300 p-4 flex flex-col items-center">
          {Graph2()}
        </div>

        <div className="w-full h-full bg-white col-span-2 rounded shadow hover:shadow-lg hover:scale-105 transition-all duration-300 p-4 flex flex-col items-center">
          {Graph3()}
        </div>

        <div className="w-full text-4xl flex items-center justify-center col-span-full h-20 bg-white shadow rounded-xl">
          <p className="font-semibold text-black/80">
            Student Statistics
          </p>
        </div>

        <div className="w-full h-96 bg-white col-span-4 rounded shadow hover:shadow-lg hover:scale-105 transition-all duration-300 p-4 flex flex-col items-center">
          {studentList()}
        </div>

        <div className="w-full bg-white col-span-5 rounded shadow hover:shadow-lg hover:scale-105 transition-all duration-300 p-4 flex flex-col items-center">
          {Graph5()}
        </div>

      </div>
    </>
  )
}