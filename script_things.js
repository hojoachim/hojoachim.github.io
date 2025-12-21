// JS file for Things page functionality

// Ensure the DOM is fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {

    let wheel = document.querySelector('.wheel');
    let spinBtn = document.querySelector('.spin-btn');
    let segments = document.querySelectorAll('.segment');
    let myModal = new bootstrap.Modal(document.getElementById('myModal'));

    // Open Bootstrap modal on segment click
    segments.forEach(segment => {
        segment.onclick = function() {
            myModal.show();
            document.getElementById('modalHeader').textContent = segment.getAttribute('data-header');
            document.getElementById('modalBody').textContent = segment.getAttribute('data-body');
            document.getElementById('modalImg').src = segment.getAttribute('data-image');
            // console.log(document.getElementById('modalImg'));
        }
    });

    // Script for spinning wheel
    // Count the number of segments
    let segmentCount = segments.length;
    let segmentAngle = 360 / segmentCount;
    // console.log(segmentCount);
    // Initial random value for spin between 1000 and 3600 deg adjusted to always stop in the middle of a segment
    let value = -(Math.floor((Math.ceil(Math.random() * 2600) + 1000) / segmentAngle) * segmentAngle - 45);
    // console.log(value);
    spinBtn.onclick = function() {
        // console.log(value);
        wheel.style.transform = "rotate(" + value + "deg)";
        // Segment angle after spin ends
        let finalValue = value;
        // console.log("Final value: " + finalValue);
        // Update value for next spin by adding another random angle between 1000 and 3600 deg adjusted to always stop in the middle of a segment
        value += -(Math.floor((Math.ceil(Math.random() * 2600) + 1000) / segmentAngle) * segmentAngle);
        // console.log(value);
        
        // Wait for the spin animation to finish, determine the selected segment and display modal
        setTimeout(() => {
            // Normalize the angle to [0, 360)
            let normalized = ((finalValue % 360) + 360) % 360;
            // console.log("Normalized angle: " + normalized);
            // Calculate the index (assuming 0deg is at the pointer)
            let index = Math.round((segmentCount - (normalized / segmentAngle)) % segmentCount);
            // let index = ((segmentCount - (normalized / segmentAngle)) % segmentCount);
            // console.log("Calculated index: " + index);
            if (index < 0) index += segmentCount;
            let selectedSegment = segments[index];
            // console.log("Selected segment index: " + index);
            // console.log("Selected segment text: " + selectedSegment.textContent.trim());
            // Open Bootstrap modal with selected segment info
            myModal.show();
            document.getElementById('modalHeader').textContent = selectedSegment.getAttribute('data-header');
            document.getElementById('modalBody').textContent = selectedSegment.getAttribute('data-body');
            document.getElementById('modalImg').src = selectedSegment.getAttribute('data-image');
        }, 3000); // match transition duration
    }
    
});
