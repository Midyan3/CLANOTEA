document.querySelector(".submit-button").addEventListener("click", async function (event) {
    event.preventDefault();
    const ClassName = document.getElementById("class").value;
    const WeekName = document.getElementById("week").value;
    const ContentName = document.getElementById("description").value;
    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);
    console.log(ClassName);
    console.log(WeekName);
    console.log(ContentName);
    console.log(file);
});



document.addEventListener('DOMContentLoaded', () => {
    const yesRadio = document.getElementById('yes');
    const noRadio = document.getElementById('no');
    const classField = document.getElementById('classField');
    const classDropdown = document.getElementById('classDropdown');
    const select = document.getElementsByClassName('Exist');

    yesRadio.addEventListener('change', () => {
        if (yesRadio.checked) {
            classField.style.display = 'none';
            classDropdown.style.display = 'block';
            fetch("/api/courses")
            .then((response) =>{
              if(response.status !== 200){
                return;
              } else {
                return response.json();
              }
            })
            .then((courses) => {
                select[0].innerHTML = '';
                courses.forEach((courses) => {

                    console.log(courses.name);
                    select[0].innerHTML += `<option class="SelectClass" value="${courses.name}">${courses.name}</option>`;
                });
            });

        }
    });

    noRadio.addEventListener('change', () => {
        if (noRadio.checked) {
            const select = document.getElementsByClassName('Exist');
            select[0].innerHTML = '';
            classField.style.display = 'block';
            classDropdown.style.display = 'none';
        }
    });
});