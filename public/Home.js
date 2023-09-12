document.addEventListener("DOMContentLoaded", (event) => {
  fetch("/api/courses")
      .then((response) => {
          if (response.status !== 200) {
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

              courseCard.onclick = function (e) {
                  // Prevent weeks' click events from being propagated to the courseCard.
                  if (e.target.className === "week-card") return;

                  // Clear existing content if weeks are already loaded
                  const videosSection = document.getElementById("videos-section");
                  while (videosSection.firstChild) {
                      videosSection.removeChild(videosSection.firstChild);
                  }
                  const notesSection = document.getElementById("notes-section");
                  while (notesSection.firstChild) {
                      notesSection.removeChild(notesSection.firstChild);
                  }

                  // If weeks are already displayed, hide them
                  if (courseCard.dataset.weeksLoaded === "true") {
                      Array.from(courseCard.children).forEach(child => {
                          if (child.className === "week-card") {
                              child.style.display = child.style.display === "none" ? "block" : "none";
                          }
                      });
                      return;
                  }

                  // If weeks are not displayed, show or load them
                  if (courseCard.dataset.loaded !== "true") {
                      fetch(`/api/courses/${course.name}/weeks`)
                          .then((response) => response.json())
                          .then((weeks) => {
                              weeks.forEach((week) => {
                                  const weekCard = document.createElement("span");
                                  weekCard.className = "week-card";
                                  weekCard.textContent = `${week.name}`;

                                  weekCard.onclick = function () {
                                      // Load content for the selected week
                                      fetch(`/api/courses/${course.name}/weeks/${week.name}/content`)
                                          .then((response) => response.json())
                                          .then(async (content) => {
                                              const contentPromises = content.map((entry) => 
                                                  fetch(`/GetContent?path=${entry.path_display}`).then(async (res) => {
                                                      const jsonResponse = await res.json();
                                                      return {
                                                          url: jsonResponse.url,
                                                          name: entry.name,
                                                          type: entry.name.endsWith(".mov") ? "video" : "note"
                                                      };
                                                  })
                                              );
                                              const allContent = await Promise.all(contentPromises);
                                              const videos = allContent.filter(entry => entry.type === "video");
                                              const notes = allContent.filter(entry => entry.type === "note");
                                              displayVideos(videos);
                                              displayNotes(notes);
                                          });
                                  };

                                  courseCard.appendChild(weekCard);
                              });
                              courseCard.dataset.loaded = "true";
                              courseCard.dataset.weeksLoaded = "true";
                          });
                  } else {
                      Array.from(courseCard.children).forEach(child => {
                          if (child.className === "week-card") {
                              child.style.display = "block";
                          }
                      });
                      courseCard.dataset.weeksLoaded = "true";
                  }
              };

              container.appendChild(courseCard);
          });
      });
});
function error() {
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = "Error loading courses. Please try again later.";
  errorDiv.style.display = "flex";
}

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

      const extension = note.name.split(".").pop();
      let fileType = "";

      // Distinguish between different file types
      switch (extension) {
          case 'pdf':
              fileType = "PDF";
              break;
          case 'docx':
              fileType = "Document";
              break;
          case 'pptx':
              fileType = "Slides";
              break;
          default:
              fileType = "Download";
              break;
      }

      const downloadLink = document.createElement("a");
      downloadLink.href = note.url;
      downloadLink.textContent = `[View/Download ${fileType}]`;
      noteElement.appendChild(downloadLink);

      notesSection.appendChild(noteElement);
  });
}

const searchBar = document.getElementById("searchBar");
searchBar.addEventListener("input", function() {
  const query = searchBar.value.toLowerCase();
  const cards = document.querySelectorAll(".card");
  cards.forEach(card => {
      if (card.textContent.toLowerCase().includes(query)) {
          card.style.display = "block";
      } else {
          card.style.display = "none";
      }
  });
});
