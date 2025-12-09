import {questionList} from "./qlist.js"
import './style.css'

let currentMode = localStorage.getItem("currentMode") || "MCQ";
let streak = localStorage.getItem("streak") || 0;

function randomInt(min, max) { // simpler syntax for the random
  let difference = max - min;
  if (Math.floor((Math.random()*difference))+min !== NaN) {
    return Math.floor((Math.random()*difference))+min;
  }
  else {
    return 0;
  }
}

function updateStreakCounter() {
  const streakBox = document.querySelector(".streak__box");
  streakBox.textContent = `CURRENT STREAK: ${streak}`
}

function putQuestionOnScreen(currentMode) {
  localStorage.setItem("currentMode", currentMode);

  const eUmlautButton = document.querySelector(".e-umlaut-button");
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
    <h2 class="question__title"> ${targetQuestion.frontSide} </h2>
    `
  );

  let correctAnswer = targetQuestion.backSide;
  if(currentMode === "MCQ") {
    insertAnswersMCQ(correctAnswer, questionId);
  }
  else if (currentMode ==="FRQ") {
    insertFormFRQ(correctAnswer, questionId)
  }
}

function createEmptyFormMCQ() {
  const answerChoices = document.getElementById("answers__container");
  answerChoices.innerHTML = "";
  answerChoices.insertAdjacentHTML("afterbegin", `
    <form class="answers__form" id="answersForm">
      <h2 class="answers__title"> Select the correct answer. </h2>
      <div class="horizontal-line"></div>
      <div class="answer-buttons__container">
      
      </div>
      <input class="answers__submit-button" type="submit" value="CONFIRM"/>
    </form>
    `)
}

function insertAnswersMCQ(correctAnswer, questionId) {
  createEmptyFormMCQ();
  let answerChoiceNumber = randomInt(0, 3);

  const answersContainer = document.querySelector(".answer-buttons__container");

  let usedIds = [];
  usedIds.push(questionId)
  for (let i = 0; i < 4; i++) {
    if (i === answerChoiceNumber) {
      answersContainer.insertAdjacentHTML(
        "beforeend",
        `<button type="button" class="answer-btn" data-answer="${correctAnswer}">
          ${correctAnswer}
        </button>`
      );
    } else {
      let wrongAnswerId = randomInt(0, questionList.length);
      while(usedIds.find((id) => id===wrongAnswerId)) {
        wrongAnswerId = randomInt(0, questionList.length);
      }
      usedIds.push(wrongAnswerId);
      let wrongAnswer = questionList[wrongAnswerId].backSide;
      answersContainer.insertAdjacentHTML("beforeend",
        `<button type="button" class="answer-btn" data-answer="${wrongAnswer}">
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
    if(selectedAnswer) {
      checkAnswerMCQ(questionId, correctAnswer, selectedAnswer);
    }
  })
}

function checkAnswerMCQ(questionId, correctAnswer, selectedAnswer) {
  const questionContainer = document.getElementById("question__container");
  questionContainer.innerHTML = "";

  const nextQuestionButton = document.getElementById("next-question");
  nextQuestionButton.textContent = "NEXT QUESTION";

  const answerForm = document.getElementById("answersForm");
  answerForm.innerHTML = "";

  const resultsContainer = document.getElementById("results__container");

  if(correctAnswer === selectedAnswer) {
    resultsContainer.insertAdjacentHTML("beforeend", `
      <div class="correct-answer showAnswerAnimation">
      <h2 class="result-text"> CORRECT! </h2>
      <h2 class="result-text"> Question: ${questionList[questionId].frontSide} </h2>
      <h2 class="result-text"> Answer: ${correctAnswer} </h2>
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
      <div class="incorrect-answer showAnswerAnimation">
      <h2 class="result-text"> INCORRECT! </h2>
      <h2 class="result-text"> Question: ${questionList[questionId].frontSide} </h2>
      <h2 class="result-text"> Correct Answer: ${correctAnswer} </h2>
      <h2 class="result-text"> You Selected: ${selectedAnswer} </h2>
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
  const eUmlautButton = document.querySelector(".e-umlaut-button");
  eUmlautButton.style.display = "block";

  const answersContainer = document.getElementById("answers__container");
  answersContainer.innerHTML = "";
  answersContainer.insertAdjacentHTML("beforeend", `
    <form class="answers__form" id="answersFormText">
      <h2 class="answers__title"> Type the correct answer. </h2>

      <input class="answers__textbox" type="text" maxlength="30" id="answer-input" name="answer-input" placeholder="Type something...">
      <input class="answers__submit-button" type="submit" value="CONFIRM"/>
    </form>
    `);
  const answersForm = document.getElementById("answersFormText")
    answersForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let answerInput = document.getElementById("answer-input").value;
      if(answerInput) {
        checkAnswerFRQ(correctAnswer, questionId, answerInput);
      }
    })
}

function checkAnswerFRQ(correctAnswer, questionId, answerInput) {
  const questionContainer = document.getElementById("question__container");
  questionContainer.innerHTML = "";

  const eUmlautButton = document.querySelector(".e-umlaut-button");
  eUmlautButton.style.display = "none";

  const nextQuestionButton = document.getElementById("next-question");
  nextQuestionButton.textContent = "NEXT QUESTION";

  const answerForm = document.getElementById("answersFormText");
  answerForm.innerHTML = "";

  const resultsContainer = document.getElementById("results__container");

  console.log(answerInput);
  console.log(correctAnswer);

  if(correctAnswer === answerInput) {
    resultsContainer.insertAdjacentHTML("beforeend", `
      <div class="correct-answer showAnswerAnimation">
      <h2 class="result-text"> CORRECT! </h2>
      <h2 class="result-text"> Question: ${questionList[questionId].frontSide} </h2>
      <h2 class="result-text"> Answer: ${correctAnswer} </h2>
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
      <div class="incorrect-answer showAnswerAnimation">
      <h2 class="result-text"> INCORRECT! </h2>
      <h2 class="result-text"> Question: ${questionList[questionId].frontSide} </h2>
      <h2 class="result-text"> Correct Answer: ${correctAnswer} </h2>
      <h2 class="result-text"> You Typed: ${answerInput} </h2>
      </div>
      `)
    const answerDiv = document.querySelector(".showAnswerAnimation");
    answerDiv.addEventListener("animationend", () => {
      answerDiv.classList.remove("showAnswerAnimation")
    })
    streak=0;
  }
  updateStreakCounter();
}

const nextQuestionButton = document.getElementById("next-question");
nextQuestionButton.addEventListener("click", () => {
  putQuestionOnScreen(currentMode);
})

const switchModeButton = document.getElementById("switch-mode");

const eUmlautButton = document.querySelector(".e-umlaut-button");
eUmlautButton.addEventListener("click", () => {
  const answerInputField = document.getElementById("answer-input");
  answerInputField.value += "ё";
})
eUmlautButton.style.display = "none";

switchModeButton.addEventListener("click", () => {
  if(currentMode === "MCQ") {
    currentMode = "FRQ";
    switchModeButton.textContent = "SWITCH TO MCQ";
    putQuestionOnScreen(currentMode);
  }
  else if(currentMode === "FRQ") {
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

updateStreakCounter();
putQuestionOnScreen(currentMode);