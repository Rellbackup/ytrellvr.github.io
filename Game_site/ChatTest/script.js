// Get references to the form, input, and target div elements
const textbox-form = document.getElementById('textbox-form');
const textbox-input = document.getElementById('textbox-input');
const targetDiv = document.getElementById('targetDiv');

// Add an event listener to the form for the 'submit' event
myForm.addEventListener('button', function(event) {
    // Prevent the default form submission behavior (which reloads the page)
    event.preventDefault();

    // Get the value typed into the input field
    const typedValue = textbox-input.value;

    // Add the typed value as new text content inside the target div
    // This example appends the new text, adding a line break for readability
    targetDiv.innerHTML += typedValue + '<br>';

    // Optional: clear the input field after submission
    textbox-input.value = '';
});


