import { useNavigate, useParams } from "react-router-dom";
import Heading1 from "../../../Components/Heading1";
import { useContext, useEffect, useState } from "react";
import { ClassroomContext } from "../../../contexts/ClassroomContext";
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';



export default function ShowActivity() {
  const navigate = useNavigate()
  const parameters = useParams();
  const [activity, setActivity] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const { classrooms } = useContext(ClassroomContext);


  useEffect(() => {
    let currentClassroom = classrooms.find(c => c.id == parameters.classroom_id);
    setActivity(currentClassroom.activities.find(act => act.id == parameters.activity_id));
    setClassroom(currentClassroom);
  }, []);


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
        <p className="text-center font-semibold text-lg">Scores Distribution</p>
        <div className="w-full my-4 px-4">
          <Bar data={data} options={options}/>
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

      <div className="w-full grid grid-cols-9 grid-rows-1 transition-all duration-300 gap-4 pb-2">
        
        <div className="w-full h-full bg-white col-span-2 row-span-2 rounded shadow hover:shadow-lg hover:scale-105 transition-all duration-300 p-4 flex flex-col items-center">
          {Graph1()}
        </div>

        <div className="w-full h-full bg-white col-span-5 row-span-2 rounded shadow hover:shadow-lg hover:scale-105 transition-all duration-300 p-4 flex flex-col items-center">
          {Graph2()}
        </div>

        <div className="w-full h-full bg-white col-span-2 row-span-2 rounded shadow hover:shadow-lg hover:scale-105 transition-all duration-300 p-4 flex flex-col items-center">
          {/* will implement tomorrow */}
        </div>

      </div>
    </>
  )
}