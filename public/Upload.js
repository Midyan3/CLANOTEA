document.querySelector(".submit-button").addEventListener("click", function (event) {
    event.preventDefault();
    const ClassName = document.getElementById("class").value;
    const WeekName = document.getElementById("week").value;
    const Title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const fileInput = document.getElementById("file");
    yesRadio = document.getElementById('yes');
    const file = fileInput.files[0];
    const formData = new FormData();
    if(!yesRadio.checked){
        formData.append("ClassName", ClassName);
    } else {
        formData.append("ClassName", document.getElementsByClassName('Exist')[0].value);
    }
    formData.append("WeekName", WeekName);
    formData.append("description",description)
    formData.append("Title", Title);
    formData.append("file", file);
    
    
    if(formData.get("ClassName") === null|| Title === "" || description === "" || file === undefined){
        alert("Please fill out all fields");
        return;
    }
    fetch("/Upload", {
        method: "POST",
        body: formData
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then((data) => {
        if(data.message === "File uploaded successfully"){
            alert("thank you for uploading");
        }
    })
    .catch((error) => {
        console.error('There was a problem with the fetch operation:', error.message);
    });
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