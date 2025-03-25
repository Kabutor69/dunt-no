// For opening and closing menu
document.querySelector(".ham").addEventListener("click", () => {
  let hedr = document.querySelector(".header-links").style;
  let log = document.querySelector(".log").style;
  let serch = document.querySelector(".serch").style;

  if (hedr.display == "none") {
    hedr.display = "grid";
    hedr.transition = "all 0.7s";
    log.display = "flex";
  } else {
    hedr.display = "none";
    log.display = "none";
  }
});

async function displayvideo() {
  try {
    let response = await fetch(`videos/`);
    console.log('Directory fetch response:', response);

    if (!response.ok) {
      throw new Error(`Error fetching directory: ${response.statusText}`);
    }

    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
      const e = array[index];
      let folder = e.href.split("/").slice(-2)[0];
      
      try {
        let metadataResponse = await fetch(`videos/${folder}/info.json`);
        console.log(`Metadata fetch response for folder ${folder}:`, metadataResponse);

        if (!metadataResponse.ok) {
          throw new Error(`Error fetching metadata for folder ${folder}: ${metadataResponse.statusText}`);
        }

        let metadata = await metadataResponse.json();
        let ved = document.querySelector(".ved");

        let videoFiles = await getVideoFiles(`videos/${folder}`);
        console.log(`Video files in folder ${folder}:`, videoFiles);

        for (let videoIndex = 0; videoIndex < videoFiles.length; videoIndex++) {
          const videoFile = videoFiles[videoIndex];
          const videoUrl = `videos/${folder}/${videoFile}`;
          let videoDuration = await getVideoDuration(videoUrl);
          let formattedDuration = formatDuration(videoDuration);

          ved.insertAdjacentHTML(
            "beforeend",
            `
            <div data-folder="${folder}" class="card">
              <a href="${videoUrl}">
                <div class="relative w-full">
                  <div class="w-full bg-gray-900 thumbnail-aspect-ratio bg-no-repeat bg-contain rounded"
                       style="background-image: url(videos/${folder}/cover.png); background-position: 50% 50%;">
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
        console.error(`Error fetching metadata for folder: ${folder}`, error);
      }
    }
  } catch (error) {
    console.error('Error fetching directory:', error);
  }
}

async function getVideoFiles(folderPath) {
  let response = await fetch(folderPath);
  let text = await response.text();
  let div = document.createElement("div");
  div.innerHTML = text;
  let anchors = div.getElementsByTagName("a");
  let videoFiles = [];

  for (let i = 0; i < anchors.length; i++) {
    const anchor = anchors[i];
    if (anchor.href.endsWith('.mp4')) {
      const videoFileName = anchor.href.split("/").pop();
      videoFiles.push(videoFileName);
    }
  }

  return videoFiles;
}

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

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

displayvideo();
