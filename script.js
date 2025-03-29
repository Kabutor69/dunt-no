// For opening and closing menu
document.querySelector(".ham").addEventListener("click", () => {
  // Get the elements and selecting their style
  let hedr = document.querySelector(".header-links").style;
  let log = document.querySelector(".log").style;
  let serch = document.querySelector(".serch").style;

  // Using if else for knowing menu is open or not
  if (hedr.display == "none") {
    // Menu is open operation
    hedr.display = "grid";
    hedr.transition = "all 0.7s";
    log.display = "flex";
  } else {
    // Menu is close operation
    hedr.display = "none";
    log.display = "none";
  }
});

async function displayvideo() {
  // Fetch the list of folders inside the /videos/ directory
  let response = await fetch(`/videos/`);
  console.log(response);

  // Get the HTML content of the directory listing
  let text = await response.text();

  // Create a temporary div to hold the fetched HTML content
  let div = document.createElement("div");
  div.innerHTML = text;

  // Get all anchor tags from the fetched HTML
  let anchors = div.getElementsByTagName("a");
  console.log(anchors);

  // Convert the HTMLCollection to an array for easier iteration
  let array = Array.from(anchors);

  // Loop through each anchor element (representing a folder)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    // Get the folder name from the href
    let folder = e.href.split("/").slice(-2)[0];

    // Now, for each folder, we need to fetch its contents (subfolders or video files)
    try {
      // Fetch the metadata from the info.json file of the folder
      let metadataResponse = await fetch(`/videos/${folder}/info.json`);
      console.log(metadataResponse);

      // Parse the JSON response containing video metadata (like title, description, etc.)
      let metadata = await metadataResponse.json();

      // Select the container where the video cards will be added
      let ved = document.querySelector(".ved");

      // Get the list of video files inside the folder (assuming they are mp4 files)
      let videoFiles = await getVideoFiles(`/videos/${folder}`);

      // Loop through each video file in the folder and display it
      for (let videoIndex = 0; videoIndex < videoFiles.length; videoIndex++) {
        const videoFile = videoFiles[videoIndex];
        const videoUrl = `/videos/${folder}/${videoFile}`;

        // Get the video duration dynamically
        let videoDuration = await getVideoDuration(videoUrl);

        // Format the duration to mm:ss
        let formattedDuration = formatDuration(videoDuration);

        // Insert the video card into the container
        ved.insertAdjacentHTML(
          "beforeend",
          `
          <div data-folder="${folder}" class="card">
            <a href="${videoUrl}">
              <div class="relative w-full">
                <div class="w-full bg-gray-900 thumbnail-aspect-ratio bg-no-repeat bg-contain rounded"
                     style="background-image: url(/videos/${folder}/cover.png); background-position: 50% 50%;">
                </div>
                <div class="absolute inset-0 z-10 grid time">
                  <span class="p-1 justify-self-end self-end">
                    <span class="font-bold">HD</span> ${formattedDuration}
                  </span>
                </div>
              </div>
              <h1>${metadata.title}</h1>
            </a>
            <h3 class="text-slate-400">
              <a href="https://www.youtube.com/channel/UC2vfvM-dzsnYqAoTrv9_n3w">${metadata.uplodedby}</a>
            </h3>
            <a href="${videoUrl}">
              <h3 class="text-slate-400">
                ${metadata.views} views
                <img class="inline ml-1" src="like.svg" width="12" height="12" alt="like">
                ${metadata.like}%
              </h3>
            </a>
          </div>
        `
        );
      }
    } catch (error) {
      // Handle errors (e.g., if the folder doesn't contain an info.json file)
      console.error(`Error fetching metadata for folder: ${folder}`, error);
    }
  }
}

// Function to get video files inside a folder (assuming they are mp4 files)
async function getVideoFiles(folderPath) {
  let response = await fetch(folderPath);
  let text = await response.text();
  let div = document.createElement("div");
  div.innerHTML = text;

  // Get all anchor tags, filter out any that don't have video files
  let anchors = div.getElementsByTagName("a");
  let videoFiles = [];

  for (let i = 0; i < anchors.length; i++) {
    const anchor = anchors[i];
    if (anchor.href.endsWith('.mp4')) {
      // Extract the video file name
      const videoFileName = anchor.href.split("/").pop();
      videoFiles.push(videoFileName);
    }
  }

  return videoFiles;
}

// Function to get video duration in seconds
function getVideoDuration(videoUrl) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    video.onerror = (err) => {
      reject("Error loading video duration");
    };
  });
}

// Function to format the duration from seconds to mm:ss format
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format as MM:SS, ensuring both minutes and seconds are two digits
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

displayvideo();
