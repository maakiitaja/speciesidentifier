/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function toggleDropdownContent() {
  document.getElementById("myDropdown").classList.toggle("show-select");
}

function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}

// document.addEventListener("click", (evt) => {
//   console.log(evt);
//   const isInput = document.getElementById("myInput").contains(evt.target);

//   const isDropdownContent = document
//     .getElementById("dropdown-content-select")
//     .contains(evt.target);

//   const isDropbtn = document
//     .getElementById("dropbtn-select")
//     .contains(evt.target);
//   console.log("isdropdowncontent:", isDropdownContent);
//   console.log("isinput:", isInput);
//   if (!isDropdownContent && !isInput && !isDropbtn) {
//     document.getElementById("myDropdown").classList.remove("show-select");
//   }
// });
