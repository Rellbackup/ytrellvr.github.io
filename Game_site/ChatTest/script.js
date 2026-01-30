// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', (event) => {
    // Select the form, input, and output elements
    const form = document.getElementById('textbox-form');
    const textInput = document.getElementById('textbox-input');
    const outputDiv = document.getElementById('outputDiv');

const middle = ": ";

 const displayform = document.getElementById('display-form');
    const displayInput = document.getElementById('displayname-input');

    // Add an event listener for the form's submit event
    form.addEventListener('submit', function(e) {
        // Prevent the default form submission behavior (which refreshes the page)
        e.preventDefault();

        // Get the value from the input field
const newText = `${displayInput.value}${middle}${textInput.value}`;
        

        // Check if the input is not empty
        if (newText.trim() !== '') {
            // Create a new div or p element for the new line of text
            const newParagraph = document.createElement('p');
            newParagraph.textContent = newText;
            
            // Optional: add some styling for spacing
            newParagraph.style.margin = '0';
            newParagraph.style.padding = '2px 0';

            // Append the new element to the output div
            outputDiv.appendChild(newParagraph);

            // Clear the input field for the next entry
            textInput.value = '';
            textInput.focus(); // Set focus back to the input field
        }
    });
});



