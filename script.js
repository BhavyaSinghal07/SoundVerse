// console.log('lets write javascript')

//to play the song and seeking it
// now the js to play song is in the last of this function
let currentSong = new Audio();   //it is a global variable
let songs;
let currfolder;


//this is a function to convert seconds of song play in minutes:seconds
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



//this is a function which provide us all the songs from folder
async function getSongs(folder) {
    currfolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    //to print only those <a> whose href has songs in them
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    

    //to put the list of songs in library
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Bhavya</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                    <img class="invert" src="play.svg" alt="">    
                            </div></li>`;   // ` this is the template lateral
    }


    //now the js to play song is here and here i attach the event listener
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {      //it will play that music which we click to play 
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs
}


//here i call a function which play the music and also give the name and time of play
const playMusic = (track, pause = false) => {
    // let audio=new Audio("/songs/" + track)
    currentSong.src = `/${currfolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}


// display all the albums on the page
async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess"))
        {
            let folder = e.href.split("/").slice(-1)[0]
            // Get the metadata of the folder
            if(folder!="songs"){
                let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
                let response = await a.json(); 
                cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="dwf" class="card">
                <div class="play">

                    <!-- play button green background svg -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 100 100"
                        xmlns:xlink="http://www.w3.org/1999/xlink" role="img"
                        style="background-color: #00ff00; border-radius: 50%; padding: 6px;">

                        <!-- play button black svg -->
                        <svg xmlns="http://www.w3.org/2000/svg" x="15%" y="14%" width="80" height="80"
                            viewBox="0 0 24 24" fill="none" class="injected-svg"
                            data-src="/icons/play-stroke-sharp.svg" color="#000000"
                            style="transform: translate(-50%, -50%);">
                            <path d="M5 20V4L19 12L5 20Z" fill="#000000" stroke="#000000" stroke-width="1.5"
                                stroke-linejoin="round"></path>
                        </svg>
                    </svg>

                </div>

                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`
            }
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)     // yaha current target isliye use kiya h taki card pr kahi bhi click kare toh vo songs ki list dede chahe hm card ki bss image pr hi kyu na click kr rahe ho
            playMusic(songs[0])

        })
    })
}


//this function is used to recall the above function
async function main() {

    //get the list of songs
    await getSongs("songs/dwf")
    playMusic(songs[0], true)

    // call the display album function
    await displayAlbums()


    //attach an event listner to play next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })


    //listen for time update event(when the song is play then the time is also update)
    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`

        //to do the variation in the seekbar
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";     // this % indicates that the proceed of this circle in seekbar is according to the size of song 
    })

    // add an event listener to the seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    
    // add an event listener to show left partition of website on clicking on hamburger icon
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left ="0"
    })

    // add an event listener to close left partition of website on clicking on close icon
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left ="-120%"
    })


    // add an event listener to previous 
    previous.addEventListener("click", ()=>{
        currentSong.pause()
        console.log("Previous clicked")

        // it helps us to give the index no of played song and changes the next song on the basis of it's index value
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if(( index - 1 ) >= 0){
            playMusic(songs[index - 1])
        }

    })

    // add an event listener to next 
    next.addEventListener("click", ()=>{
        currentSong.pause()
        console.log("Next clicked")

        // it helps us to give the index no of played song and changes the next song on the basis of it's index value
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if(( index + 1 ) < songs.length){
            playMusic(songs[index + 1])
        }
    })


    // add an event listener for the functioning of range of volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        console.log(e, e.target, e.target.value)
        currentSong.volume = parseInt(e.target.value)/100
    })

}

main().catch(console.error)