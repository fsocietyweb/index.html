const sidebar = document.getElementById("sidebar");
const btn = document.getElementById("menuToggle");

if (sidebar && btn) {
  btn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !btn.contains(e.target)) {
      sidebar.classList.remove("open");
    }
  });
}