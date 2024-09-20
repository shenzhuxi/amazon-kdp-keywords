
function removeStopWords(words) {
    const stopWordsList = ["i","me","my","myself","we","our","ours","ourselves","you","your","yours","yourself","yourselves","he","him","his","himself","she","her","hers","herself","it","its","itself","they","them","their","theirs","themselves","what","which","who","whom","this","that","these","those","am","is","are","was","were","be","been","being","have","has","had","having","do","does","did","doing","a","an","the","and","but","if","or","because","as","until","while","of","at","by","for","with","about","against","between","into","through","during","before","after","above","below","to","from","up","down","in","out","on","off","over","under","again","further","then","once","here","there","when","where","why","how","all","any","both","each","few","more","most","other","some","such","no","nor","not","only","own","same","so","than","too","very","s","t","can","will","just","don","should","now", 'the', 'alpha', 'male', 'daddy'];
    return words.filter(item => !stopWordsList.includes(item));
}

function extractQuotedWordsAndRest(str) {
    // Regular expression to match quoted words (including single and double quotes)
    const quotedRegex = /"[^"]*"|'[^']*'/g;
  
    // Extract quoted words
    let quotedWords = str.match(quotedRegex);
    if (quotedWords) {
        for (let i = 0; i < quotedWords.length; i++) {
            quotedWords[i] = quotedWords[i].replaceAll(`"`, ``);
        }
    } else {
        quotedWords = []
    }
    // Replace quoted words with placeholders in the original string
    const placeholderStr = str.replace(quotedRegex, 'PLACEHOLDER');
  
    // Split the remaining string by spaces
    const restWords = placeholderStr.split(' ').filter(word => word !== 'PLACEHOLDER');

    return [...quotedWords, ...restWords ];
}

function fitWordsIntoContainers(words) {
    words = words.filter(item => item.length > 2);
    words = words.map(item => item.toLowerCase());
    words = Array.from(new Set(words));
    words = removeStopWords(words)
    // Sort words by length in descending order
    words.sort((a, b) => b.length - a.length);
    console.log(words)
    const quotedWords = [];
    let currentQuote = "";

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word.startsWith('"') && !word.endsWith('"')) {
            currentQuote += word;
        } else if (word.endsWith('"') && currentQuote.length > 0) {
            currentQuote += " " + word;
            quotedWords.push(currentQuote);
            currentQuote = "";
        } else {
            if (currentQuote.length > 0) {
            words[i - 1] = currentQuote;
            currentQuote = "";
            }
            words[i] = word;
        }
    }

    return optimizeTextFit(words);
}

let btn = document.getElementById("submit");
btn.onclick = () => {
    let text = document.getElementById("keywords").value;
    text = text
        .replace(/\n/g, " ") // Replace line breaks with spaces
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .replace(/[^\w\s\"]/g, "") // Remove non-word characters (except spaces)
        .trim();
    document.getElementById("keywords").value = text;
    const words = extractQuotedWordsAndRest(text);
    const result = fitWordsIntoContainers(words);
    
    console.log("Filled containers:", result.texts);
    console.log("Leftover words:", result.leftovers);
    // Create HTML text inputs and populate them with the container content
    const containers = result.texts;
    const containerDiv = document.getElementById("output");
    containerDiv.innerHTML = ""; // Clear any previous content
    for (let i = 0; i < containers.length; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 50;
        input.value = containers[i];
        containerDiv.appendChild(input);
        const span = document.createElement("span");
        span.innerText = containers[i].length;
        containerDiv.appendChild(span);
    }
    document.getElementById("unusedkeywords").innerHTML = "<b>Unused: </b>" + result.leftovers.join(" ");
}

function optimizeTextFit(words, maxLength = 50) {
    // Sort words by length in descending order
    words.sort((a, b) => b.length - a.length);

    let combinedTexts = [];
    let currentText = "";
    let spaceLeft;

    words.forEach(word => {
        // Calculate remaining space after adding the word
        if (currentText) {
            spaceLeft = maxLength - (currentText.length + word.length + 1); // +1 for space
        } else {
            spaceLeft = maxLength - word.length;
        }

        if (spaceLeft >= 0) {
            // Add the word to the current text
            if (currentText) {
                currentText += " " + word;
            } else {
                currentText = word;
            }
        } else {
            // Save the current combined text and start a new one
            combinedTexts.push(currentText);
            currentText = word;
        }
    });

    // Don't forget the last text
    if (currentText) {
        combinedTexts.push(currentText);
    }

    // Return the first 7 texts and any leftover words
    const texts = combinedTexts.slice(0, 7);
    const leftovers = combinedTexts.slice(7);

    return { texts, leftovers };
}