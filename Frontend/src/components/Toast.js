import Swal from "sweetalert2";


export default function Toast(icon = "success", info = "Successful!", duration = 2000) {
  Swal.fire({
    icon: icon,
    title: info,
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: duration,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });
}