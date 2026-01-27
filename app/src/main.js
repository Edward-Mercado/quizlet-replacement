import { questionList } from "./qlist.js"
import './style.css'

let currentMode = localStorage.getItem("currentMode") || "MCQ";
let viewOrPlay = localStorage.getItem("view-or-play") || "play";
let streak = Number(JSON.parse(localStorage.getItem("streak"))) || 0;
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
    <h2 class="goldman-regular"> ${targetQuestion.frontSide} </h2>
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
      <input class="btn animation-button-press bg-purple-900 text-white hover:bg-purple-500 hover:text-black w-full rounded-full"  type="submit" value="CONFIRM"/>
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
        `<button type="button" class="btn answer-btn bg-indigo-800 hover:bg-blue-500 active:bg-blue-300 animation-button-press hover:text-black active:text-black m-3 my-5 text-white w-[80%] rounded-full p-1 tektur-regular" data-answer="${correctAnswer}">
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
        `<button type="button" class="btn animation-button-press answer-btn bg-indigo-800 hover:bg-blue-500 active:bg-blue-300 hover:text-black active:text-black m-3 my-5 text-white w-[80%] rounded-full p-1 tektur-regular" data-answer="${wrongAnswer}">
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

      <input class="bg-purple-300 text-black tektur-regular w-[90%] h-[15%] p-2 rounded-2xl my-2 pl-5" type="text" maxlength="30" id="answer-input" name="answer-input" placeholder="Type something...">
      <input class="my-5 btn animation-button-press bg-purple-900 text-white hover:bg-purple-500 hover:text-black w-full rounded-full"  type="submit" value="CONFIRM"/>
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

  if (correctAnswer.toLowerCase().replaceAll(" ", "") === answerInput.toLowerCase().replaceAll(" ", "")) {
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

document.getElementById("view-or-play-button").addEventListener("click", () => {
  console.log(viewOrPlay)
  if (viewOrPlay === "view") {
    viewOrPlay = "play";
    showAllWords();
  } else {
    viewOrPlay = "view"
    putQuestionOnScreen(currentMode)
  }
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

updateStreakCounter();