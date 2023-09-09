document.addEventListener("DOMContentLoaded", (event) => {
  fetch("/api/courses")
    .then((response) =>{
      if(response.status !== 200){
        error();
        return;
      } else {
        return response.json();
      }
    })
    .then((courses) => {
      const container = document.querySelector(".Classes");
      courses.forEach((course) => {
        const courseCard = document.createElement("div");
        courseCard.className = "card";
        courseCard.id = course.name;
        courseCard.textContent = course.name;

        courseCard.onclick = function () {
          // If weeks are already loaded and visible, hide them
          if (courseCard.dataset.loaded === "true") {
            const weekCards = courseCard.querySelectorAll(".week-card");
            if (weekCards[0].style.display === "none" || !weekCards[0].style.display) {
              weekCards.forEach((weekCard) => {
                weekCard.style.display = "block";
              });
            } else {
              weekCards.forEach((weekCard) => {
                weekCard.style.display = "none";
              });
              return; // Don't load weeks again
            }
          } else {
            // Check if weeks are not yet loaded, then load them
            fetch(`/api/courses/${course.name}/weeks`)
              .then((response) => response.json())
              .then((weeks) => {
                weeks.forEach((week) => {
                  const weekCard = document.createElement("span");
                  weekCard.className = "week-card";
                  weekCard.textContent = `${week.name}`;

                  weekCard.onclick = function () {
                    // Clear existing videos and notes
                    const videosSection = document.getElementById("videos-section");
                    while (videosSection.firstChild) {
                      videosSection.removeChild(videosSection.firstChild);
                    }

                    const notesSection = document.getElementById("notes-section");
                    while (notesSection.firstChild) {
                      notesSection.removeChild(notesSection.firstChild);
                    }

                    // Load content for the selected week
                    fetch(`/api/courses/${course.name}/weeks/${week.name}/content`)
                      .then((response) => response.json())
                      .then(async (content) => {
                        const videosPromises = content
                          .filter((entry) => entry.name.endsWith(".mov"))
                          .map((video) =>
                            fetch(`/GetVideo?path=${video.path_display}`).then(async (res) => {
                              const jsonResponse = await res.json();
                              return {
                                  url: jsonResponse.url,
                                  name: video.name
                              };
                            })
                          );

                        const video = await Promise.all(videosPromises);

                        const notes = content.filter(
                          (entry) => !entry.name.endsWith(".mov")
                        );
                        displayVideos(video);
                        displayNotes(notes);
                      });
                  };
                  courseCard.appendChild(weekCard);
                });
                courseCard.dataset.loaded = "true";
              });
          }
        };
        container.appendChild(courseCard);
      });
    });
});

function displayVideos(videos) {
  const videosSection = document.getElementById("videos-section");
  videos.forEach((video) => {
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    videoContainer.innerHTML = `
        <video>
            <source class="video" src="${video.url}" type="video/mp4">
        </video>
        <div class="play-button">▶</div>
        <div class="video-title">${video.name}</div>
    `;
    const videoElement = videoContainer.querySelector('video');
    
    videoElement.addEventListener('click', function() {
      videoElement.requestFullscreen();
      videoElement.play();
    });

    videosSection.appendChild(videoContainer);
  });
}

function displayNotes(notes) {
  const notesSection = document.getElementById("notes-section");
  notes.forEach((note) => {
    const noteElement = document.createElement("div");
    noteElement.className = "note";
    noteElement.textContent = note.name;
    notesSection.appendChild(noteElement);
  });
}

function error() {
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = "Error loading courses. Please try again later.";
  errorDiv.style.display = "flex";
}
