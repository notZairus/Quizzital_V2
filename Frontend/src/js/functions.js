export function backendUrl(address) {
  return import.meta.env.VITE_BACKEND_SERVER_URL + address;
}


export async function getClassroom(user, insertClassroom) {
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
    console.clear();
    console.log(result);
    insertClassroom(result);
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
    insertClassroom(result);
  }
}

export async function getQuizzes(user, insertQuizzes) {
  if (user.role === "professor") {
    let res = await fetch(backendUrl(`/quiz?user_id=${user.id}`));
    let quizzes = await res.json();
    insertQuizzes(quizzes);
  }
  else if (user.role === "student") {
    console.log('tite')
  }
}


export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result); // Return Base64 string
      reader.onerror = error => reject(error);
  });
}