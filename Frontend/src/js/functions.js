export function backendUrl(address) {
  return import.meta.env.VITE_BACKEND_SERVER_URL + address;
}


export async function getClassroom(user, setClassrooms) {
  if (user.role === "professor") {
    let response = await fetch(backendUrl('/get_classrooms'), {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        user_id: user.id,
        role: user.role
      })
    })

    let result = await response.json();
    setClassrooms(result);
  }
  else if (user.role === "student") {
    let response = await fetch(backendUrl('/get_classrooms'), {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        user_id: user.id,
        role: user.role
      })
    })

    let result = await response.json();
    setClassrooms(result);
  }
}

export async function getQuizzes(user, setQuizzes) {
  if (user.role === "professor") {
    let res = await fetch(backendUrl(`/quiz?user_id=${user.id}`));
    let quizzes = await res.json();
    setQuizzes(quizzes);
  }
  else if (user.role === "student") {

  }
}