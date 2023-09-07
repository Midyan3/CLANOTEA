document.addEventListener("DOMContentLoaded", (event) => {
  fetch("/api/courses")
    .then((response) => response.json())
    .then((courses) => {
      const container = document.querySelector(".Classes");
      courses.forEach((course) => {
        const courseCard = document.createElement("div");
        courseCard.className = "card";
        courseCard.id = course.name;
        courseCard.textContent = course.name;
        courseCard.onclick = function () {
          if (courseCard.dataset.loaded !== "true") {
            // Check if weeks are already loaded
            fetch(`/api/courses/${course.name}/weeks`)
              .then((response) => response.json())
              .then((weeks) => {
                weeks.forEach((week) => {
                  const weekCard = document.createElement("span");
                  weekCard.className = "week-card";
                  weekCard.textContent = `${week.name}`;
                  weekCard.onclick = function () {
                    fetch(
                      `/api/courses/${course.name}/weeks/${week.name}/content`
                    )
                      .then((response) => response.json())
                      .then(async (content) => {
                        const videosPromises = content
                          .filter((entry) => entry.name.endsWith(".mov"))
                          .map((video) =>
                            fetch(`/GetVideo?path=${video.path_display}`).then( async (res) =>{
                              const jsonResponse = await res.json();
                              return {
                                  url: jsonResponse.url,
                                  name: video.name
                              };
                            }
                          )

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
  console.log(videos);  
  videos.forEach((video) => {
    console.log(video.url);
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
      console.log('Video clicked!');
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
