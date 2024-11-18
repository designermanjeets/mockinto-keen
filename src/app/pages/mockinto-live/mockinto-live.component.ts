import { AfterContentInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../services/shared.service';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription, timestamp } from 'rxjs';
import * as moment from 'moment';

import noUiSlider from 'nouislider';

declare var window: any;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

const grammar =
  "#JSGF V1.0; grammar colors; public <color> = aqua | azure | beige | bisque | black | blue | brown | chocolate | coral | crimson | cyan | fuchsia | ghostwhite | gold | goldenrod | gray | green | indigo | ivory | khaki | lavender | lime | linen | magenta | maroon | moccasin | navy | olive | orange | orchid | peru | pink | plum | purple | red | salmon | sienna | silver | snow | tan | teal | thistle | tomato | turquoise | violet | white | yellow ;";

let recognition: any;
let speechRecognitionList: any;

@Component({
  selector: 'app-mockinto-live',
  templateUrl: './mockinto-live.component.html',
  styleUrls: ['./mockinto-live.component.scss']
})
export class MockintoLiveComponent implements OnInit, AfterContentInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  private unsubscribe: Subscription[] = [];

  isMeetingProgress: boolean = false;
  jobPostingId: string = '';
  jogIDBotQuestions: any = [];

  // Speech Systhesizer Functionality Starts Here
  synth = window.speechSynthesis;
  voiceSelect: any = [];
  speechSynthesisInProgress: boolean = false;
  SpeechRecognitionisInProgress: boolean = false;
  isReadyForNextQuestion: boolean = false;
  currentInterimTranscript: string = '';
  currentFinalTanscript: string = '';

  // Keep Track of Current Question
  currentQuestionIndex: number = 0;
  candidateAnswers: any = [];
  mockintoQueAnsBank: any = [];

  voicePitch: number = 0;
  voiceRate: number = 0;

  constructor(
    private cdRef: ChangeDetectorRef,
    private sharedService: SharedService,
    private router: Router
  ) {
    const loadingSubscr = this.isLoading$.asObservable().subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(): void {
    this.jobPostingId = this.router.url.split('/')[3]; // Fixed Position Don't Change the Path in routing
  }

  ngAfterContentInit(): void {
    const slider_pitach = document.querySelector("#kt_slider_voice_pitch") as HTMLElement | any;
    if(slider_pitach) {
      noUiSlider.create(slider_pitach, {
        start: [0, 90],
        connect: true,
        range: {
            "min": 0,
            "max": 100
        }
      });
      slider_pitach.noUiSlider.on("update", (values: any, handle: any) => {
        if (handle) {
            this.voicePitch = values[handle]/100;
        }
      });
    }

    const slider_rate = document.querySelector("#kt_slider_voice_rate") as HTMLElement | any;
    if(slider_rate) {
      noUiSlider.create(slider_rate, {
        start: [0, 90],
        connect: true,
        range: {
            "min": 0,
            "max": 100
        }
      });
      slider_rate.noUiSlider.on("update", (values: any, handle: any) => {
        if (handle) {
            this.voiceRate = values[handle]/100;
        }
      });
    }
  }
  
  startOrStopMockinto() {
    if(this.isMeetingProgress) {
      this.isMeetingProgress = false;
      this.jogIDBotQuestions = [];
    } else {
      if(this.SpeechRecognitionisInProgress || this.speechSynthesisInProgress) {
        this.resetRecognition();
        this.synth.cancel();
      }
      this.fetchAllMockintoQuestionsByJobPostingId();
    }
  }

  fetchAllMockintoQuestionsByJobPostingId() {
    this.isLoading$.next(true);
    this.sharedService.fetchAllMockintoQuestionsByJobPostingId(this.jobPostingId).subscribe((res) => {
      this.jogIDBotQuestions = res;
      this.isLoading$.next(false);
      if(this.jogIDBotQuestions.length > 0) {
        this.isMeetingProgress = true;
        this.startWebkitSpeechRecognition(this.jogIDBotQuestions[this.currentQuestionIndex].question);
      }
    });
  }

  // Speech Systhesizer Functionality Starts Here

  startWebkitSpeechRecognition(question: string) {

    this.populateVoiceList();

    this.startSysntehticVoice(question);
  }

  populateVoiceList() {
    const voices = this.synth.getVoices();
    for (const voice of voices) {
      const option = document.createElement("option");
      option.textContent = `${voice.name} (${voice.lang})`;
      if (voice.default) {
        option.textContent += " — DEFAULT";
      }
      option.setAttribute("data-lang", voice.lang);
      option.setAttribute("data-name", voice.name);
      this.voiceSelect.push(option);
    }
  }

  startSysntehticVoice(question: string) {
    const voices = this.synth.getVoices();
    const utterThis = new SpeechSynthesisUtterance(question);
    const selectedOption = this.voiceSelect[1].getAttribute('data-name');
    for (const voice of voices) {
      if (voice.name === selectedOption) {
        utterThis.voice = voice;
      }
    }
    utterThis.pitch = this.voicePitch; //pitch.value;
    utterThis.rate = this.voiceRate; //rate.value;
    this.synth.speak(utterThis);

    utterThis.onstart = (event) => {
      this.speechSynthesisInProgress = true;
      this.mockintoQueAnsBank.push({
        question: event.utterance.text,
        answer: '',
        ques_timestamp: moment(event.timeStamp).format('HH:mm:ss'),
        isAnswered: false,
        ans_timestamp: ''
      });
      this.cdRef.detectChanges();
    };

    utterThis.onerror = (event) => {
      console.error('An error has occurred with the speech synthesis: ' + event.error);
      this.speechSynthesisInProgress = false;
      this.cdRef.detectChanges();
    };

    utterThis.onend = (event) => {
      this.speechSynthesisInProgress = false;
      const recordButton = document.querySelector('#record_answer_tooltip') as HTMLElement | any;
      setTimeout(() => recordButton.focus(), 1000);
      this.cdRef.detectChanges();
    };

  }

  onRecordAnswer() {

    if(this.SpeechRecognitionisInProgress) {
      this.resetRecognition();
      return;
    }

    if (SpeechRecognition && SpeechGrammarList) {
      recognition = new SpeechRecognition();
      speechRecognitionList = new SpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
      recognition.continuous = true;
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
    } else {
      console.error('SpeechRecognition API is not supported in this browser.');
    }

    recognition.start();

    recognition.onaudiostart = (event: any) => {
      this.SpeechRecognitionisInProgress = true;
      this.mockintoQueAnsBank[this.currentQuestionIndex].ans_timestamp = moment(event.timeStamp).format('HH:mm:ss');
      this.mockintoQueAnsBank[this.currentQuestionIndex].isAnswered = true;
      this.cdRef.detectChanges();
    };

    recognition.onresult = (event: any) => {

      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (!(event.results[i][0].confidence > 0)) continue;
        if(event.results[i][0].confidence >= 0.8) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
            this.currentFinalTanscript = this.currentFinalTanscript + finalTranscript;
          } else {
            interimTranscript += event.results[i][0].transcript;
            this.mockintoQueAnsBank[this.currentQuestionIndex].answer = this.currentFinalTanscript + interimTranscript;
          }
        }
      }
      this.cdRef.detectChanges();
    };

    recognition.onend = () => {
      this.resetRecognition();
    };

  }

  resetRecognition() {

    recognition.stop();

    this.currentInterimTranscript = '';
    this.currentFinalTanscript = '';

    this.SpeechRecognitionisInProgress = false;
    this.isReadyForNextQuestion = true;
    // Next Question Tooltip
    const nextQuestionButton = document.querySelector('#next_question_tooltip') as HTMLElement | any;
    setTimeout(() => nextQuestionButton.focus(), 1000);
    this.cdRef.detectChanges();
  }

  onNextQuestion() {
    this.currentQuestionIndex++;
    if(this.currentQuestionIndex < this.jogIDBotQuestions.length) {
      this.isReadyForNextQuestion = false;
      this.startWebkitSpeechRecognition(this.jogIDBotQuestions[this.currentQuestionIndex].question);
    } else {
      this.isMeetingProgress = false;
      this.jogIDBotQuestions = [];
      this.currentQuestionIndex = 0;
    }
  }

}