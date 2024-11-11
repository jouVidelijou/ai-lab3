let map;
const puzzleSize = { rows: 4, cols: 4 };
let pieces = [];

function initMap() {
    map = L.map('map-container').setView([53.4, 14.5], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}

function exportMap() {
    leafletImage(map, function(err, canvas) {
        if (err) {
            console.error("Error capturing map image:", err);
            return;
        }

        const img = new Image();
        img.onload = function() {
            createPuzzle(img);
        };
        img.src = canvas.toDataURL();
    });
}

function createPuzzle(img) {
    const { rows, cols } = puzzleSize;
    const pieceWidth = img.width / cols;
    const pieceHeight = img.height / rows;
    const puzzleContainer = document.getElementById('puzzle-container');
    puzzleContainer.innerHTML = '';
    pieces = [];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const piece = document.createElement('canvas');
            piece.className = 'piece';
            piece.style.width = `${pieceWidth}px`;
            piece.style.height = `${pieceHeight}px`;
            piece.style.backgroundImage = `url(${img.src})`;
            piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
            piece.style.left = `${Math.random() * (600 - pieceWidth)}px`;
            piece.style.top = `${Math.random() * (400 - pieceHeight)}px`;

            piece.dataset.row = row;
            piece.dataset.col = col;
            pieces.push(piece);
            puzzleContainer.appendChild(piece);

            piece.addEventListener('mousedown', dragStart);
        }
    }

    const bgImage = document.createElement('img');
    bgImage.src = img.src;
    bgImage.style.position = 'absolute';
    bgImage.style.width = '100%';
    bgImage.style.height = '100%';
    bgImage.style.filter = 'blur(5px)';
    bgImage.style.opacity = '0.4';
    puzzleContainer.insertBefore(bgImage, puzzleContainer.firstChild);
}

function dragStart(e) {
    const piece = e.target;
    const startX = e.clientX - piece.offsetLeft;
    const startY = e.clientY - piece.offsetTop;

    function dragMove(e) {
        piece.style.left = `${e.clientX - startX}px`;
        piece.style.top = `${e.clientY - startY}px`;
    }

    function dragEnd() {
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        checkPiecePosition(piece);
    }

    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
}

function checkPiecePosition(piece) {
    const { rows, cols } = puzzleSize;
    const containerRect = document.getElementById('puzzle-container').getBoundingClientRect();
    const pieceRect = piece.getBoundingClientRect();
    const pieceWidth = containerRect.width / cols;
    const pieceHeight = containerRect.height / rows;

    const col = Math.round((pieceRect.left - containerRect.left) / pieceWidth);
    const row = Math.round((pieceRect.top - containerRect.top) / pieceHeight);

    if (col === parseInt(piece.dataset.col) && row === parseInt(piece.dataset.row)) {
        piece.style.left = `${col * pieceWidth}px`;
        piece.style.top = `${row * pieceHeight}px`;
        piece.style.zIndex = 1;
    }

    checkPuzzleCompletion();
}

function showMyLocation() {
  navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      console.log(latitude, longitude);
      map.setView([latitude, longitude], 13);
      if (marker) map.removeLayer(marker);
      marker = L.marker([latitude, longitude]).addTo(map);
      document.getElementById('coordinates').textContent = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
  }, error => {
      console.error("Error getting location:", error);
  });
}

function checkPuzzleCompletion() {
    const isCompleted = pieces.every(piece => {
        const col = parseInt(piece.dataset.col);
        const row = parseInt(piece.dataset.row);
        const left = parseInt(piece.style.left);
        const top = parseInt(piece.style.top);
        const pieceWidth = piece.offsetWidth;
        const pieceHeight = piece.offsetHeight;


        return left === col * pieceWidth && top === row * pieceHeight;
    });
    console.log("isCompleted:", isCompleted);
    if (isCompleted) {
      setTimeout(() => {
        alert("Perfect! You have done it!");
      }, 500);
      showNotification("Perfect! You have done it!");
    }
}

function showNotification(message) {
    new Notification(message);
}


document.addEventListener('DOMContentLoaded', function() {
    initMap();
    Notification.requestPermission();
    new Notification("Lets play puzzle game!");
    document.getElementById('download-map-btn').addEventListener('click', exportMap);
    document.getElementById('location-btn').addEventListener('click', showMyLocation);
});