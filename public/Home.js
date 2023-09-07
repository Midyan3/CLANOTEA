document.addEventListener('DOMContentLoaded', (event) => {
    fetch('/api/courses')
        .then(response => response.json())
        .then(courses => {
            const container = document.querySelector('.container');
            courses.forEach(course => {
                const courseCard = document.createElement('div');
                courseCard.className = 'card';
                courseCard.id = course.name;  
                courseCard.textContent = course.name;
                courseCard.onclick = function() {
                    if (courseCard.dataset.loaded !== "true") { // Check if weeks are already loaded
                        fetch(`/api/courses/${course.name}/weeks`)
                            .then(response => response.json())
                            .then(weeks => {
                                weeks.forEach(week => {
                                    const weekCard = document.createElement('div');
                                    weekCard.className = 'week-card';
                                    weekCard.textContent = `${week.name}`;
                                    weekCard.onclick = function() {
                                        fetch(`/api/courses/${course.name}/weeks/${week.name}/content`)
                                            .then(response => response.json())
                                            .then(async content => {
                                                const videosPromises = content.filter(entry => entry.name.endsWith('.mov'))
                                                    .map(video => fetch(`/GetVideo?path=${video.path}`).then(res => res.json()));
                                    
                                                const videoUrls = await Promise.all(videosPromises);
                                                
                                                const notes = content.filter(entry => !entry.name.endsWith('.mp4'));
                                                displayVideos(videoUrls);
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
    const videosSection = document.getElementById('videos-section');
    videos.forEach(video => {
        videosSection.innerHTML += `           
         <div class="video-container">
            <video></video>
            <div class="play-button">▶</div>
            <div class = "video-title">Video Title</div>
            </div>    
        </div> `;        
    });
}

function displayNotes(notes) {
    const notesSection = document.getElementById('notes-section');
    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.textContent = note.name;
        notesSection.appendChild(noteElement);
    });
}
