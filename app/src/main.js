import { allQuestionLists } from './qlists.js'
import './style.css'

let allQuestions = {
  'name': "All Words",
  'words': [],
  'isCustom': false
}
allQuestionLists.forEach((questionList) => {
  questionList.words.forEach((word) => {
    allQuestions.words.push(word)
  })
})
allQuestionLists.unshift(allQuestions)

let currentMode = localStorage.getItem("currentMode") || "MCQ";
let viewOrPlay = localStorage.getItem("view-or-play") || "view"
let streak = Number(JSON.parse(localStorage.getItem("streak"))) || 0;
let customLists = JSON.parse(localStorage.getItem("custom-lists")) || [];
let qListName = localStorage.getItem("question-list-name") || allQuestionLists[0].name

customLists.forEach((list) => {
  allQuestionLists.push(list)
})

let questionList = JSON.parse(localStorage.getItem("question-list")) || allQuestionLists[0].words
console.log(questionList)

let questionDictionary =  allQuestionLists.find((qlist) => qlist.name === qListName)

if(questionDictionary) {
  if(questionDictionary.isCustom) {
    document.getElementById("delete-question-list").style.display = ""
  } else {
    document.getElementById("delete-question-list").style.display = "none"
  } 
}

let onResultsPage = false
let isTyping = false

function randomInt(min, max) { // simpler syntax for the random
  let difference = max - min;
  if (Math.floor((Math.random() * difference)) + min !== NaN) {
    return Math.floor((Math.random() * difference)) + min;
  }
  else {
    return 0;
  }
}

function updateStreakCounter() {
  const streakBox = document.getElementById("streak__box");
  streakBox.textContent = `CURRENT STREAK: ${streak}`
}

function putQuestionOnScreen(currentMode) {
  isTyping = false
  document.getElementById("next-question").style.display = ""
  document.getElementById("switch-mode").style.display = ""
  onResultsPage = false
  localStorage.setItem("currentMode", currentMode);
  localStorage.setItem("view-or-play", "play");
  document.getElementById("view-or-play-button").textContent = "VIEW WORDS"
  document.getElementById("view-all-words").style.display = 'none';
  document.getElementById("question-containers").style.display = '';

  const eUmlautButton = document.getElementById("e-umlaut-button");
  eUmlautButton.style.display = "none";

  const nextQuestionButton = document.getElementById("next-question");
  nextQuestionButton.textContent = "REROLL QUESTION";

  let questionId = randomInt(1, questionList.length);
  let targetQuestion = questionList[questionId];

  const resultsContainer = document.getElementById("results__container");
  resultsContainer.innerHTML = "";

  const questionContainer = document.getElementById("question__container");
  questionContainer.innerHTML = "";
  questionContainer.insertAdjacentHTML("beforeend",
    `
    <h2 class="goldman-regular text-2xl font-black"> ${targetQuestion.frontSide} </h2>
    `
  );

  let correctAnswer = targetQuestion.backSide;
  if (currentMode === "MCQ") {
    insertAnswersMCQ(correctAnswer, questionId);
  }
  else if (currentMode === "FRQ") {
    insertFormFRQ(correctAnswer, questionId)
  }
}

function createEmptyFormMCQ() {
  const answerChoices = document.getElementById("answers__container");
  answerChoices.innerHTML = "";
  answerChoices.insertAdjacentHTML("afterbegin", `
    <form class="w-full flex flex-col justify-around items-center" id="answersForm">
      <h2 class="goldman-regular my-4"> Select the correct answer. </h2>
      <div class="w-full h-[3%] my-4 rounded-full bg-white text-[0.001em]">.</div>
      <div id="answer-buttons__container" class="flex flex-col items-center justify-around w-full">
      
      </div>
      <input class="btn animation-button-press bg-purple-900 text-white hover:bg-purple-500 hover:text-black w-full rounded-full audiowide-regular"  type="submit" value="CONFIRM"/>
    </form>
    `)
}

function insertAnswersMCQ(correctAnswer, questionId) {
  createEmptyFormMCQ();
  let answerChoiceNumber = randomInt(0, 3);

  const answersContainer = document.getElementById("answer-buttons__container");

  let usedIds = [];
  usedIds.push(questionId)
  for (let i = 0; i < 4; i++) {
    if (i === answerChoiceNumber) {
      answersContainer.insertAdjacentHTML(
        "beforeend",
        `<button type="button" class="btn answer-btn bg-indigo-800 hover:bg-blue-500 active:bg-blue-300 animation-button-press hover:text-black active:text-black m-3 my-4 text-white w-[80%] rounded-full p-1 tektur-regular" data-answer="${correctAnswer}">
          ${correctAnswer}
        </button>`
      );
    } else {
      let wrongAnswerId = randomInt(0, questionList.length);
      while (usedIds.find((id) => id === wrongAnswerId)) {
        wrongAnswerId = randomInt(0, questionList.length);
      }
      usedIds.push(wrongAnswerId);
      let wrongAnswer = questionList[wrongAnswerId].backSide;
      answersContainer.insertAdjacentHTML("beforeend",
        `<button type="button" class="btn animation-button-press answer-btn bg-indigo-800 hover:bg-blue-500 active:bg-blue-300 hover:text-black active:text-black m-3 my-4 text-white w-[80%] rounded-full p-1 tektur-regular" data-answer="${wrongAnswer}">
          ${wrongAnswer}
        </button>`)
    }
  }

  let selectedAnswer = "";
  const answerButtons = document.querySelectorAll(".answer-btn");
  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      answerButtons.forEach((button) => {
        button.classList.remove("selected");
      })
      button.classList.add("selected");
      selectedAnswer = button.getAttribute("data-answer");
    })
  })

  const answerForm = document.getElementById("answersForm");
  answerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (selectedAnswer) {
      checkAnswerMCQ(questionId, correctAnswer, selectedAnswer);
    }
  })
}

function checkAnswerMCQ(questionId, correctAnswer, selectedAnswer) {
  onResultsPage = true
  const questionContainer = document.getElementById("question__container");
  questionContainer.innerHTML = "";

  const nextQuestionButton = document.getElementById("next-question");
  nextQuestionButton.textContent = "NEXT QUESTION";

  const answerForm = document.getElementById("answersForm");
  answerForm.innerHTML = "";

  const resultsContainer = document.getElementById("results__container");

  if (correctAnswer === selectedAnswer) {
    resultsContainer.insertAdjacentHTML("beforeend", `
      <div class="fixed top-[25%] h-[50%] w-[50%] left-[25%] flex flex-col items-center justify-between showAnswerAnimation bg-green-400/90 py-6 rounded-2xl border-3 border-green-700/90">
      <h2 class="text-emerald-950 font-black goldman-bold text-6xl text-center"> CORRECT! </h2>
      <h2 class="text-emerald-950 font-black goldman-bold text-4xl text-center"> Question: ${questionList[questionId].frontSide} </h2>
      <h2 class="text-emerald-950 font-black goldman-bold text-4xl text-center"> Answer: <span class="tektur-regular"> ${correctAnswer} </span> </h2>
      </div>
      `)
    const answerDiv = document.querySelector(".showAnswerAnimation");
    answerDiv.addEventListener("animationend", () => {
      answerDiv.classList.remove("showAnswerAnimation")
    })
    streak++;
    localStorage.setItem("streak", JSON.stringify(streak))
  }
  else {
    resultsContainer.insertAdjacentHTML("beforeend", `
      <div class="fixed top-[25%] h-[50%] w-[50%] left-[25%] flex flex-col items-center justify-between showAnswerAnimation bg-red-500/90 py-6 rounded-2xl border-3 border-red-800/90 showAnswerAnimation">
      <h2 class="text-rose-950 font-black goldman-bold text-6xl"> INCORRECT! </h2>
      <h2 class="text-rose-950 font-black goldman-bold text-2xl"> Question: ${questionList[questionId].frontSide} </h2>
      <h2 class="text-rose-950 font-black goldman-bold text-2xl"> Correct Answer: ${correctAnswer} </h2>
      <h2 class="text-rose-950 font-black tektur-regular text-2xl"> You Selected: ${selectedAnswer} </h2>
      </div>
      `)
    const answerDiv = document.querySelector(".showAnswerAnimation");
    answerDiv.addEventListener("animationend", () => {
      answerDiv.classList.remove("showAnswerAnimation")
    })

    streak = 0;
  }
  updateStreakCounter();
}

function insertFormFRQ(correctAnswer, questionId) {
  isTyping = true
  const eUmlautButton = document.getElementById("e-umlaut-button");
  eUmlautButton.style.display = "block";

  const answersContainer = document.getElementById("answers__container");
  answersContainer.innerHTML = "";
  answersContainer.insertAdjacentHTML("beforeend", `
    <form class="w-full flex flex-col justify-between items-center h-[130%]" id="answersFormText">
      <h2 class="goldman-regular my-2"> Type the correct answer. </h2>
      <div class="w-full h-[3%] my-4 rounded-full bg-white text-[0.001em]">.</div>

      <input class="bg-purple-300 text-black tektur-regular w-[90%] h-[15%] p-2 rounded-2xl my-2 pl-5 focus:border-3 focus:outline-none focus:bg-purple-200 transition-all ease-in-out duration-300 focus:border-black" type="text" maxlength="30" id="answer-input" name="answer-input" placeholder="Type something...">
      <input class="my-5 btn animation-button-press bg-purple-900 text-white hover:bg-purple-500 hover:text-black w-full rounded-full audiowide-regular"  type="submit" value="CONFIRM"/>
    </form>
    `);
  const answersForm = document.getElementById("answersFormText")
  answersForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let answerInput = document.getElementById("answer-input").value;
    if (answerInput) {
      checkAnswerFRQ(correctAnswer, questionId, answerInput);
    }
  })
}

function FRQ_Forgiveness(correctAnswer, answerInput) {
  let correctAnswerForgiven = correctAnswer
    .toLowerCase()
    .replaceAll(/[()/, ]/g, "")
  let answerInputForgiven = answerInput
    .toLowerCase()
    .replaceAll(/[()/, ]/g, "")

  if(correctAnswerForgiven === answerInputForgiven) {
    return true
  } else {
    return false
  }
}

function checkAnswerFRQ(correctAnswer, questionId, answerInput) {
  onResultsPage = true
  const questionContainer = document.getElementById("question__container");
  questionContainer.innerHTML = "";

  const eUmlautButton = document.getElementById("e-umlaut-button");
  eUmlautButton.style.display = "none";

  const nextQuestionButton = document.getElementById("next-question");
  nextQuestionButton.textContent = "NEXT QUESTION";

  const answerForm = document.getElementById("answersFormText");
  answerForm.innerHTML = "";

  const resultsContainer = document.getElementById("results__container");

  console.log(answerInput);
  console.log(correctAnswer);

  if (FRQ_Forgiveness(correctAnswer, answerInput)) {
    resultsContainer.insertAdjacentHTML("beforeend", `
      <div class="fixed top-[25%] h-[50%] w-[50%] left-[25%] flex flex-col items-center justify-between showAnswerAnimation bg-green-400/90 py-6 rounded-2xl border-3 border-green-700/90">
      <h2 class="text-emerald-950 font-black goldman-bold text-6xl text-center"> CORRECT! </h2>
      <h2 class="text-emerald-950 font-black goldman-bold text-4xl text-center"> Question: ${questionList[questionId].frontSide} </h2>
      <h2 class="text-emerald-950 font-black goldman-bold text-4xl text-center"> Answer: <span class="tektur-regular"> ${correctAnswer} </span> </h2>
      </div>
      `)
    const answerDiv = document.querySelector(".showAnswerAnimation");
    answerDiv.addEventListener("animationend", () => {
      answerDiv.classList.remove("showAnswerAnimation")
    })
    streak++;
  }
  else {
    resultsContainer.insertAdjacentHTML("beforeend", `
      <div class="fixed top-[25%] h-[50%] w-[50%] left-[25%] flex flex-col items-center justify-between showAnswerAnimation bg-red-500/90 py-6 rounded-2xl border-3 border-red-800/90 showAnswerAnimation">
      <h2 class="text-rose-950 font-black goldman-bold text-6xl"> INCORRECT! </h2>
      <h2 class="text-rose-950 font-black goldman-bold text-2xl"> Question: ${questionList[questionId].frontSide} </h2>
      <h2 class="text-rose-950 font-black goldman-bold text-2xl"> Correct Answer: <span class="tektur-regular"> ${correctAnswer} </span> </h2>
      <h2 class="text-rose-950 font-black goldman-bold text-2xl"> You Typed: <span class="tektur-regular"> ${answerInput} </span> </h2>
      </div>
      `)
    const answerDiv = document.querySelector(".showAnswerAnimation");
    answerDiv.addEventListener("animationend", () => {
      answerDiv.classList.remove("showAnswerAnimation")
    })
    streak = 0;
  }
  updateStreakCounter();
}

const nextQuestionButton = document.getElementById("next-question");
nextQuestionButton.addEventListener("click", () => {
  putQuestionOnScreen(currentMode);
})

const switchModeButton = document.getElementById("switch-mode");

const eUmlautButton = document.getElementById("e-umlaut-button");
eUmlautButton.addEventListener("click", () => {
  const answerInputField = document.getElementById("answer-input");
  answerInputField.value += "ё";
})
eUmlautButton.style.display = "none";

switchModeButton.addEventListener("click", () => {
  if (currentMode === "MCQ") {
    currentMode = "FRQ";
    switchModeButton.textContent = "SWITCH TO MCQ";
    putQuestionOnScreen(currentMode);
  }
  else if (currentMode === "FRQ") {
    currentMode = "MCQ";
    switchModeButton.textContent = "SWITCH TO FRQ";
    putQuestionOnScreen(currentMode);
  }
})

if (currentMode === "MCQ") {
  switchModeButton.textContent = "SWITCH TO FRQ";
}
else {
  switchModeButton.textContent = "SWITCH TO MCQ";
}

function showAllWords() {
  isTyping = false

  document.getElementById("question-containers").style.display = 'none';
  document.getElementById("next-question").style.display = "none"
  document.getElementById("switch-mode").style.display = "none"
  document.getElementById("view-all-words").style.display = '';
  localStorage.setItem("view-or-play", "view");
  document.getElementById("view-or-play-button").textContent = "PLAY GAME"
}

function selectNewList(targetList) {
  questionList = targetList.words
  localStorage.setItem("question-list-name", targetList.name)
  qListName = targetList.name
  if(targetList.isCustom) {
    document.getElementById("delete-question-list").style.display = ""
  } else {
    document.getElementById("delete-question-list").style.display = "none"
  }
  localStorage.setItem("question-list", JSON.stringify(targetList.words))

  if (viewOrPlay === "view") {
    putQuestionOnScreen(currentMode)
  }
  document.getElementById("view-all-words").innerHTML = ""
  questionList.forEach((question) => {
    document.getElementById("view-all-words").insertAdjacentHTML("beforeend", `
      <div class="flex w-full flex-row justify-between bg-purple-600 m-3 h-[10vh] px-[3%] items-center rounded-2xl">
        <h2 class="border-2 border-black bg-purple-900 w-[45%] h-[80%] flex justify-center items-center rounded-full font-bold goldman-regular text-xl"> ${question.frontSide} </h2>
        <h2 class="border-2 border-black bg-purple-900 w-[45%] h-[80%] flex justify-center items-center rounded-full font-bold tektur-regular text-xl"> ${question.backSide} </h2>
      </div>
    `)
  })
}

questionList.forEach((question) => {
  document.getElementById("view-all-words").insertAdjacentHTML("beforeend", `
    <div class="flex w-full flex-row justify-between bg-purple-600 m-3 h-[10vh] px-[3%] items-center rounded-2xl">
      <h2 class="border-2 border-black bg-purple-900 w-[45%] h-[80%] flex justify-center items-center rounded-full font-bold goldman-regular text-xl"> ${question.frontSide} </h2>
      <h2 class="border-2 border-black bg-purple-900 w-[45%] h-[80%] flex justify-center items-center rounded-full font-bold tektur-regular text-xl"> ${question.backSide} </h2>
    </div>
    `)
})

if (viewOrPlay === "view") {
  showAllWords();
} else {
  putQuestionOnScreen(currentMode)
}

if (viewOrPlay === "view") {
  viewOrPlay = 'play'
} else {
  viewOrPlay = "view"
}

document.getElementById("view-or-play-button").addEventListener("click", () => {
  if (viewOrPlay === "view") {
    viewOrPlay = "play";
    showAllWords();
  } else {
    viewOrPlay = "view"
    putQuestionOnScreen(currentMode)
  }
})

document.getElementById("list-change").addEventListener("click", () => {
  if (document.getElementById("question-lists-div")) {
    return
  }

  document.querySelector("body").insertAdjacentHTML("beforeend", `
    <div id="question-lists-div" class="bg-black/95 rounded-2xl border-purple-950 border-2 w-[90vw] h-[90vh] fixed z-120 right-[5vw] top-[5vh] items-center flex flex-col showAnswerAnimation">
    <div class="flex justify-around items-center h-[20%] w-full">
      <h2 class="audiowide-regular bg-purple-900 px-10 border-purple-950 rounded-full text-center text-2xl m-3 h-[60%] w-[55%] flex items-center"> VOCAB LISTS...</h2>
      <button id="create-list-button" class="animation-button-press btn bg-purple-900 hover:bg-purple-500 active:bg-purple-300 hover:text-black border-3 border-purple-950 rounded-full h-[60%] w-[40%] audiowide-regular text-xl"> CREATE YOUR OWN LIST </button>
    </div>
      <div class="w-[95%] h-[2%] my-4 rounded-full bg-white text-[0.001em]">.</div>
      <div id="question-lists-container" class="flex justify-around flex-wrap flex-row h-[69%] w-full">

      </div>
      <button id="close-question-lists-button" class="animation-button-press btn bg-purple-900 hover:bg-purple-500 active:bg-purple-300 hover:text-black border-3 border-purple-950 rounded-full w-[80%] audiowide-regular my-5">CLOSE MENU</button>
    </div>
    `)

  document.getElementById("create-list-button")
    .addEventListener("click", () => {
      document.getElementById('question-lists-div').remove()

      document.querySelector("body").insertAdjacentHTML("afterbegin", `
      <button id="cancel-custom-list" class="audiowide-regular bg-purple-900 hover:bg-purple-500 animation-button-press px-10 border-purple-950 rounded-full text-center text-4xl fixed right-2 z-150 top-2"> CANCEL </button>
      <form id="custom-word-list-form" class="fixed bg-black/90 w-full h-full z-130 p-5 overflow-y-scroll"> 
        <h2 class="audiowide-regular bg-purple-900 px-10 border-purple-950 rounded-full text-center text-4xl fixed top-2"> SELECT WORDS </h2>
        <div id="custom-word-selection" class="mt-[5%] w-full overflow-y-scroll">
      
        </div>
        </form>
      `)
      
      document.getElementById("cancel-custom-list").addEventListener("click", () => {
        document.getElementById("custom-word-list-form").remove()
        document.getElementById("cancel-custom-list").remove()
      })

      allQuestionLists.forEach((questionList) => {
        if (questionList.name !== "All Words") {
          document.getElementById("custom-word-selection")
            .insertAdjacentHTML("beforeend", `
            <h2 class="audiowide-regular bg-purple-900 px-10 border-purple-950 rounded-full text-center text-2xl"> ${questionList.name} </h2>
            `)
          questionList.words.forEach((word) => {
            document.getElementById("custom-word-selection").insertAdjacentHTML("beforeend", `
              <div class="my-2">
                <input id="${word.frontSide}" type="checkbox"  class="checkbox wordCheckbox" data-listId="${word.listId}"/>
                <label for="${word.frontSide}" class="tektur-regular mx-2"> ${word.frontSide} ||| ${word.backSide} </label>
              </div>
      `)
          })
        }
      })

      document.getElementById("custom-word-list-form").insertAdjacentHTML("beforeend", `
        <input class="bg-purple-300 text-black tektur-regular w-[90%] h-[5vh] p-2 rounded-2xl my-2 pl-5" type="text" maxlength="30" id="list-name" placeholder="Name your custom vocabulary list...">
        <input type="submit" value="CONFIRM" class="animation-button-press btn bg-purple-900 border-3 border-purple-950 hover:bg-purple-500 active:bg-purple-300 rounded-full w-[30%] audiowide-regular"/>
        `)

      document.getElementById("custom-word-list-form").addEventListener("submit", (e) => {
        e.preventDefault()
        document.getElementById("cancel-custom-list").remove()
        let checkBoxes = Array.from(document.querySelectorAll(".wordCheckbox:checked"))

        let customListWords = []

        checkBoxes.forEach((checkbox) => {
          let word = allQuestions.words.find((word) => word.frontSide === checkbox.id && word.listId === checkbox.getAttribute("data-listId"))
          customListWords.push(word)
        })
        let questionList = {
          'name': document.getElementById("list-name").value,
          'words': customListWords,
          'isCustom': true
        }
        console.log(questionList)
        customLists.push(questionList)
        allQuestionLists.push(questionList)
        document.getElementById("custom-word-list-form").remove()
        selectNewList(questionList)
        localStorage.setItem("custom-lists", JSON.stringify(customLists))
      })

    })

  document.getElementById("question-lists-div")
    .addEventListener("animationend", () => {
      document.getElementById("question-lists-div").classList.remove("showAnswerAnimation")
    })

  document.getElementById("close-question-lists-button").addEventListener("click", () => {
    document.getElementById('question-lists-div').remove()
  })

  allQuestionLists.forEach((list) => {
    document.getElementById('question-lists-container').insertAdjacentHTML("beforeend", `
        <button id="${list.name}" class="questionListButton animation-button-press btn bg-purple-900 border-3 border-purple-950 hover:bg-purple-500 active:bg-purple-300 rounded-full w-[30%] audiowide-regular"> ${list.name} </button>
      `)
  })

  document.querySelectorAll(".questionListButton").forEach((button) => {
    button.addEventListener("click", () => {

      let targetList = allQuestionLists.find((list) => list.name === button.id)
      if (targetList) {
        document.getElementById('question-lists-div').remove()
        selectNewList(targetList)
      }
    })
  })
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && onResultsPage) {
    putQuestionOnScreen(currentMode);
  }
})

document.addEventListener("keydown", (event) => {
  if (event.key === 'Meta' && isTyping) {
    const answerInputField = document.getElementById("answer-input");
    answerInputField.value += "ё";
  }
})

document.getElementById("delete-question-list").addEventListener("click", () => {
  let deleteList = allQuestionLists.find((qlist) => qlist.name === qListName)
  allQuestionLists.pop(deleteList)
  customLists.pop(deleteList)
  localStorage.setItem("custom-lists", JSON.stringify(customLists))
  selectNewList(allQuestionLists[0])
})

updateStreakCounter();