import React, { useState, useEffect, useRef } from "react";
import { socket } from "./services/socket";
import { BackgroundDecorations } from "./components/BackgroundDecorations";
import { QuizHome } from "./components/QuizHome";
import { CreateQuiz } from "./components/CreateQuiz";
import { JoinQuiz } from "./components/JoinQuiz";
import { WaitingRoom } from "./components/WaitingRoom";
import { Countdown } from "./components/Countdown";
import { QuizGame } from "./components/QuizGame";
import { QuizResult } from "./components/QuizResult";
import { DEMO_QUESTIONS } from "./data/demoQuestions";
import { Radio, Wifi, WifiOff } from "lucide-react";

function getOrCreatePlayerId() {
  let id = sessionStorage.getItem("english_quiz_player_id");
  if (!id) {
    id = "p_" + Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem("english_quiz_player_id", id);
  }
  return id;
}

export default function App() {
  // Navigation / Views: 'home' | 'create' | 'join' | 'waiting' | 'quiz' | 'result'
  const [currentView, setCurrentView] = useState("home");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Player Profile
  const [playerId] = useState(getOrCreatePlayerId);
  const [playerName, setPlayerName] = useState(() => {
    return sessionStorage.getItem("english_quiz_player_name") || localStorage.getItem("english_quiz_player_name") || "Player " + Math.floor(100 + Math.random() * 900);
  });
  const [playerAvatar, setPlayerAvatar] = useState(() => {
    return sessionStorage.getItem("english_quiz_player_avatar") || localStorage.getItem("english_quiz_player_avatar") || "avatar-1";
  });
  const [userRole, setUserRole] = useState("host"); // 'host' | 'guest'

  // Room State
  const [activeRoomId, setActiveRoomId] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [isRoomStarting, setIsRoomStarting] = useState(false);
  const [countdownData, setCountdownData] = useState(null); // { count, text }

  // Game Play State
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(10);
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [isIntermission, setIsIntermission] = useState(false);
  const [intermissionData, setIntermissionData] = useState(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Authoritative server timestamp ref
  const questionEndTimeRef = useRef(null);

  // Demo mode refs
  const demoTimerRef = useRef(null);
  const demoIndexRef = useRef(0);
  const demoUserAnswerRef = useRef(null);
  const demoBotAnswerRef = useRef(null);
  const demoBotTimeoutRef = useRef(null);

  // Persist player info
  useEffect(() => {
    localStorage.setItem("english_quiz_player_name", playerName);
  }, [playerName]);

  useEffect(() => {
    localStorage.setItem("english_quiz_player_avatar", playerAvatar);
  }, [playerAvatar]);

  // Check URL params for ?room=CODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get("room");
    if (urlRoom) {
      setActiveRoomId(urlRoom.toUpperCase());
      setCurrentView("join");
    }
  }, []);

  // Try reconnecting active session if available in sessionStorage
  const attemptSessionRecovery = () => {
    try {
      const saved = sessionStorage.getItem("active_quiz_session");
      if (!saved) return;
      const session = JSON.parse(saved);
      if (!session.roomId || !session.playerId) return;

      socket.emit("reconnect-room", { roomId: session.roomId, playerId: session.playerId }, (res) => {
        if (res?.success) {
          setActiveRoomId(session.roomId);
          setUserRole(res.role);
          setRoomData(res.room);

          if (res.gameStatus === "in-progress" || res.gameStatus === "intermission") {
            setCurrentQuestion(res.currentQuestion);
            if (res.questionEndTime && !res.isIntermission) {
              questionEndTimeRef.current = res.questionEndTime;
              const remaining = Math.max(0, Math.ceil((res.questionEndTime - Date.now()) / 1000));
              setQuestionTimeLeft(remaining);
            } else {
              setQuestionTimeLeft(res.timeLeft ?? 10);
            }
            setIsIntermission(res.isIntermission);
            if (res.isIntermission && res.myAnswer) {
              setAnswerFeedback(res.myAnswer);
            }
            setOpponentAnswered(res.opponentAnswered);
            setCurrentView("quiz");
          } else if (res.gameStatus === "waiting") {
            setCurrentView("waiting");
          }
        } else {
          sessionStorage.removeItem("active_quiz_session");
        }
      });
    } catch (e) {
      // Ignore recovery errors
    }
  };

  // Socket.IO Connection & Event Handlers
  useEffect(() => {
    function onConnect() {
      console.log("[App] Socket online. Connected ID:", socket.id);
      setIsConnected(true);
      attemptSessionRecovery();
    }
    function onDisconnect(reason) {
      console.warn("[App] Socket offline. Reason:", reason);
      setIsConnected(false);
    }
    function onConnectError(error) {
      console.error("[App] Socket connect_error:", error?.message || error);
      setIsConnected(false);
    }

    function onPlayerJoined({ room, guestPlayer }) {
      setRoomData(room);
    }

    function onRoomUpdated({ room }) {
      setRoomData(room);
    }

    function onCountdownTick({ count, text }) {
      setCountdownData({ count, text });
      setIsRoomStarting(true);
    }

    function onQuizStarted({ totalQuestions, timePerQuestion, hostPlayer, guestPlayer }) {
      setCountdownData(null);
      setIsRoomStarting(false);
      setCurrentView("quiz");
      setRoomData(prev => ({
        ...prev,
        gameStatus: "in-progress",
        totalQuestions,
        hostPlayer,
        guestPlayer
      }));
    }

    function onQuestionStart({ question, timeLeft, questionStartTime, questionEndTime, hostPlayer, guestPlayer }) {
      setCurrentQuestion(question);
      setAnswerFeedback(null);
      setOpponentAnswered(false);
      setIsIntermission(false);
      const endTime = questionEndTime || (Date.now() + 10000);
      questionEndTimeRef.current = endTime;
      const initialRemaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setQuestionTimeLeft(initialRemaining);
      setRoomData(prev => ({
        ...prev,
        hostPlayer,
        guestPlayer
      }));
    }

    function onTimerTick({ timeLeft, questionEndTime }) {
      if (questionEndTime) {
        questionEndTimeRef.current = questionEndTime;
        const remaining = Math.max(0, Math.ceil((questionEndTime - Date.now()) / 1000));
        setQuestionTimeLeft(remaining);
      } else {
        setQuestionTimeLeft(typeof timeLeft === "number" ? timeLeft : 10);
      }
    }

    function onAnswerFeedback(feedback) {
      setAnswerFeedback(feedback);
    }

    function onAnswerSubmitted(data) {
      // Server acknowledges that THIS player's answer was safely recorded.
      // Question remains on current index; client stays waiting for opponent.
    }

    function onOpponentAnsweredStatus() {
      setOpponentAnswered(true);
    }

    function onScoresUpdated({ hostPlayer, guestPlayer }) {
      setRoomData(prev => ({
        ...prev,
        hostPlayer,
        guestPlayer
      }));
    }

    function onQuestionEnded(data) {
      questionEndTimeRef.current = null;
      setQuestionTimeLeft(0);
      setIsIntermission(true);
      setIntermissionData(data);
      setRoomData(prev => ({
        ...prev,
        hostPlayer: data.hostPlayer,
        guestPlayer: data.guestPlayer
      }));
    }

    function onQuizCompleted(result) {
      setIsIntermission(false);
      setFinalResult(result);
      setCurrentView("result");
      sessionStorage.removeItem("active_quiz_session");
    }

    function onQuizReset({ room }) {
      setRoomData(room);
      setCurrentView("waiting");
      setFinalResult(null);
      setAnswerFeedback(null);
    }

    function onPlayerTemporarilyDisconnected({ role, name }) {
      setOpponentDisconnected(true);
    }

    function onPlayerReconnected({ role, name }) {
      setOpponentDisconnected(false);
    }

    function onPlayerLeft({ role, message }) {
      setOpponentDisconnected(true);
      if (role === "host") {
        alert(message || "The host left the match.");
        handleReturnHome();
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("reconnect", onConnect);
    socket.on("player-joined", onPlayerJoined);
    socket.on("room-updated", onRoomUpdated);
    socket.on("countdown-tick", onCountdownTick);
    socket.on("quiz-started", onQuizStarted);
    socket.on("question-start", onQuestionStart);
    socket.on("timer-tick", onTimerTick);
    socket.on("answer-submitted", onAnswerSubmitted);
    socket.on("answer-feedback", onAnswerFeedback);
    socket.on("opponent-answered-status", onOpponentAnsweredStatus);
    socket.on("scores-updated", onScoresUpdated);
    socket.on("question-ended", onQuestionEnded);
    socket.on("quiz-completed", onQuizCompleted);
    socket.on("quiz-reset", onQuizReset);
    socket.on("player-temporarily-disconnected", onPlayerTemporarilyDisconnected);
    socket.on("player-reconnected", onPlayerReconnected);
    socket.on("player-left", onPlayerLeft);

    setIsConnected(socket.connected);
    if (socket.connected) {
      attemptSessionRecovery();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("reconnect", onConnect);
      socket.off("player-joined", onPlayerJoined);
      socket.off("room-updated", onRoomUpdated);
      socket.off("countdown-tick", onCountdownTick);
      socket.off("quiz-started", onQuizStarted);
      socket.off("question-start", onQuestionStart);
      socket.off("timer-tick", onTimerTick);
      socket.off("answer-submitted", onAnswerSubmitted);
      socket.off("answer-feedback", onAnswerFeedback);
      socket.off("opponent-answered-status", onOpponentAnsweredStatus);
      socket.off("scores-updated", onScoresUpdated);
      socket.off("question-ended", onQuestionEnded);
      socket.off("quiz-completed", onQuizCompleted);
      socket.off("quiz-reset", onQuizReset);
      socket.off("player-temporarily-disconnected", onPlayerTemporarilyDisconnected);
      socket.off("player-reconnected", onPlayerReconnected);
      socket.off("player-left", onPlayerLeft);
    };
  }, []);

  // Smooth local countdown synchronized with server timestamp
  useEffect(() => {
    if (isDemoMode) return;
    const ticker = setInterval(() => {
      if (questionEndTimeRef.current && !isIntermission) {
        const remaining = Math.max(0, Math.ceil((questionEndTimeRef.current - Date.now()) / 1000));
        setQuestionTimeLeft(remaining);
      }
    }, 200);
    return () => clearInterval(ticker);
  }, [isIntermission, isDemoMode]);

  // ----------------------------------------------------
  // REAL-TIME ACTIONS
  // ----------------------------------------------------
  const handleCreateRoom = (settings) => {
    if (isDemoMode) {
      startDemoMode(settings);
      return;
    }

    setIsLoading(true);
    socket.emit("create-room", { ...settings, hostId: playerId }, (res) => {
      setIsLoading(false);
      if (res?.success) {
        setUserRole("host");
        setActiveRoomId(res.roomId);
        setRoomData(res.room);
        setCurrentView("waiting");

        sessionStorage.setItem("active_quiz_session", JSON.stringify({
          roomId: res.roomId,
          playerId,
          role: "host"
        }));
      } else {
        alert("Failed to create room: " + (res?.error || "Unknown error"));
      }
    });
  };

  const handleJoinRoom = ({ roomId, playerName, playerAvatar }, onError) => {
    if (isDemoMode) {
      startDemoMode({ hostName: playerName, hostAvatar: playerAvatar });
      return;
    }

    setIsLoading(true);
    socket.emit("join-room", { roomId, guestId: playerId, playerName, playerAvatar }, (res) => {
      setIsLoading(false);
      if (res?.success) {
        setUserRole("guest");
        setActiveRoomId(res.roomId);
        setRoomData(res.room);
        setCurrentView("waiting");

        sessionStorage.setItem("active_quiz_session", JSON.stringify({
          roomId: res.roomId,
          playerId,
          role: "guest"
        }));
      } else {
        if (onError) onError(res?.error || "Could not join room.");
      }
    });
  };

  const handleStartQuiz = () => {
    if (isDemoMode) {
      startDemoCountdown();
      return;
    }

    socket.emit("start-quiz", { roomId: activeRoomId }, (res) => {
      if (!res?.success) {
        alert(res?.error || "Failed to start quiz.");
      }
    });
  };

  const handleSubmitAnswer = (questionIndex, answer) => {
    if (isDemoMode) {
      handleDemoSubmitAnswer(questionIndex, answer);
      return;
    }

    socket.emit("submit-answer", {
      roomId: activeRoomId,
      questionIndex,
      answer
    }, (res) => {
      if (res?.error) {
        console.warn("Submit error:", res.error);
      }
    });
  };

  const handlePlayAgain = () => {
    if (isDemoMode) {
      startDemoCountdown();
      return;
    }

    socket.emit("play-again", { roomId: activeRoomId });
  };

  const handleLeaveRoom = () => {
    if (activeRoomId) {
      socket.emit("leave-room", { roomId: activeRoomId });
    }
    sessionStorage.removeItem("active_quiz_session");
    handleReturnHome();
  };

  const handleReturnHome = () => {
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    if (demoBotTimeoutRef.current) clearTimeout(demoBotTimeoutRef.current);
    sessionStorage.removeItem("active_quiz_session");
    setCurrentView("home");
    setRoomData(null);
    setCountdownData(null);
    setCurrentQuestion(null);
    setAnswerFeedback(null);
    setFinalResult(null);
    setIsRoomStarting(false);
    setOpponentDisconnected(false);
  };

  // ----------------------------------------------------
  // DEMO MODE (STANDALONE OFFLINE MULTIPLAYER SIMULATION)
  // ----------------------------------------------------
  const startDemoMode = (settings) => {
    const demoRoomId = "DEMO99";
    setActiveRoomId(demoRoomId);
    setUserRole("host");

    const demoRoom = {
      roomId: demoRoomId,
      hostPlayer: {
        id: "demo_host",
        name: settings?.hostName || playerName,
        avatar: settings?.hostAvatar || playerAvatar,
        score: 0,
        correctCount: 0,
        wrongCount: 0,
        role: "host"
      },
      guestPlayer: {
        id: "demo_bot",
        name: "Anaya (Bot)",
        avatar: "avatar-2",
        score: 0,
        correctCount: 0,
        wrongCount: 0,
        role: "guest"
      },
      quizSettings: {
        category: settings?.category || "Mixed English",
        difficulty: "Medium",
        questionCount: 10,
        timePerQuestion: 10
      },
      totalQuestions: 10,
      gameStatus: "waiting"
    };

    setRoomData(demoRoom);
    setCurrentView("waiting");
  };

  const startDemoCountdown = () => {
    setIsRoomStarting(true);
    let count = 3;
    setCountdownData({ count: 3 });

    const cInterval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownData({ count });
      } else if (count === 0) {
        setCountdownData({ count: 0, text: "GO!" });
      } else {
        clearInterval(cInterval);
        setCountdownData(null);
        setIsRoomStarting(false);
        demoIndexRef.current = 0;
        setCurrentView("quiz");
        loadDemoQuestion(0);
      }
    }, 1000);
  };

  const loadDemoQuestion = (index) => {
    if (index >= DEMO_QUESTIONS.length) {
      endDemoQuiz();
      return;
    }

    const q = DEMO_QUESTIONS[index];
    demoIndexRef.current = index;
    demoUserAnswerRef.current = null;
    demoBotAnswerRef.current = null;
    if (demoBotTimeoutRef.current) clearTimeout(demoBotTimeoutRef.current);

    setCurrentQuestion({
      index,
      total: DEMO_QUESTIONS.length,
      category: q.category,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options
    });

    setAnswerFeedback(null);
    setOpponentAnswered(false);
    setIsIntermission(false);
    setQuestionTimeLeft(10);

    // Bot opponent answers after 3-5 seconds
    const botDelay = 3000 + Math.random() * 2000;
    demoBotTimeoutRef.current = setTimeout(() => {
      setOpponentAnswered(true);
      const isCorrect = Math.random() > 0.3;
      demoBotAnswerRef.current = { isCorrect };
      checkBothDemoAnswered(index);
    }, botDelay);

    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    let remaining = 10;
    demoTimerRef.current = setInterval(() => {
      remaining -= 1;
      setQuestionTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(demoTimerRef.current);
        endDemoQuestion(index, "timeout");
      }
    }, 1000);
  };

  const handleDemoSubmitAnswer = (questionIndex, answer) => {
    if (demoUserAnswerRef.current !== null) return;
    const rawQ = DEMO_QUESTIONS[questionIndex];
    const isCorrect = answer === rawQ.correctAnswer;
    demoUserAnswerRef.current = { answer, isCorrect };

    checkBothDemoAnswered(questionIndex);
  };

  const checkBothDemoAnswered = (questionIndex) => {
    if (demoUserAnswerRef.current !== null && demoBotAnswerRef.current !== null) {
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);
      if (demoBotTimeoutRef.current) clearTimeout(demoBotTimeoutRef.current);
      endDemoQuestion(questionIndex, "all-answered");
    }
  };

  const endDemoQuestion = (questionIndex, reason) => {
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    if (demoBotTimeoutRef.current) clearTimeout(demoBotTimeoutRef.current);

    const rawQ = DEMO_QUESTIONS[questionIndex];
    const userAns = demoUserAnswerRef.current;
    const botAns = demoBotAnswerRef.current;

    const userCorrect = userAns ? userAns.isCorrect : false;
    const botCorrect = botAns ? botAns.isCorrect : false;

    setRoomData(prev => ({
      ...prev,
      hostPlayer: {
        ...prev.hostPlayer,
        score: prev.hostPlayer.score + (userCorrect ? 1 : 0),
        correctCount: prev.hostPlayer.correctCount + (userCorrect ? 1 : 0),
        wrongCount: prev.hostPlayer.wrongCount + (userCorrect ? 0 : 1)
      },
      guestPlayer: {
        ...prev.guestPlayer,
        score: (prev.guestPlayer?.score || 0) + (botCorrect ? 1 : 0),
        correctCount: (prev.guestPlayer?.correctCount || 0) + (botCorrect ? 1 : 0),
        wrongCount: (prev.guestPlayer?.wrongCount || 0) + (botCorrect ? 0 : 1)
      }
    }));

    setAnswerFeedback({
      isCorrect: userCorrect,
      correctAnswer: rawQ.correctAnswer,
      explanation: rawQ.explanation,
      userScore: (roomData?.hostPlayer?.score || 0) + (userCorrect ? 1 : 0),
      selectedAnswer: userAns?.answer || null
    });

    setIsIntermission(true);
    setTimeout(() => {
      loadDemoQuestion(questionIndex + 1);
    }, 2500);
  };

  const endDemoQuiz = () => {
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    const host = roomData.hostPlayer;
    const guest = roomData.guestPlayer;
    const total = DEMO_QUESTIONS.length;

    let winner = host.score > guest.score ? host.name : (guest.score > host.score ? guest.name : null);
    let isDraw = host.score === guest.score;

    setFinalResult({
      winner,
      isDraw,
      hostStats: {
        ...host,
        accuracy: Math.round((host.correctCount / total) * 100),
        totalQuestions: total
      },
      guestStats: {
        ...guest,
        accuracy: Math.round((guest.correctCount / total) * 100),
        totalQuestions: total
      },
      totalQuestions: total
    });

    setCurrentView("result");
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#4B5563] flex flex-col items-center justify-start relative px-3 sm:px-6 py-4 sm:py-6 selection:bg-[#F4E3A1] selection:text-[#1F2937]">
      {/* Background atmospheric warm golden decorations */}
      <BackgroundDecorations />

      {/* Synchronized 3-2-1-GO Countdown Overlay */}
      {countdownData && (
        <Countdown count={countdownData.count} text={countdownData.text} />
      )}

      {/* Responsive App Frame Container (Adapts from mobile to tablet/desktop) */}
      <div className="w-full max-w-xl relative z-10 flex flex-col min-h-[92vh] safe-pb">
        {/* Secondary Views Header (Only shown when not on home screen) */}
        {currentView !== "home" && (
          <header className="flex items-center justify-between pb-3 px-1 text-xs text-[#6B7280] border-b border-[#F1D58A]/50 mb-4 bg-[#FFFFFF]">
            <div className="flex items-center gap-2">
              <span className="font-black text-[#1F2937] text-base tracking-tight font-display">
                Wordplay
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF8E7] border border-[#F1D58A] text-[#9A7610] font-bold">
                1v1 Arena
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#22C55E]">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                {isConnected ? "Live" : "Offline"}
              </span>

              <button
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={`px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wide transition flex items-center gap-1 ${
                  isDemoMode 
                    ? "bg-[#D4AF37] text-[#1F2937] border-[#E8C96A] shadow-sm" 
                    : "bg-[#FFFDF5] text-[#4B5563] border-[#E5D8B0] hover:bg-[#FFF8E7]"
                }`}
                title="Toggle between Real-Time Multiplayer and Solo Demo Mode"
              >
                <Radio className="w-2.5 h-2.5 text-[#9A7610]" />
                <span>{isDemoMode ? "Solo Bot" : "1v1 Online"}</span>
              </button>
            </div>
          </header>
        )}

        {/* View Switcher */}
        <main className="flex-1 flex flex-col">
          {currentView === "home" && (
            <QuizHome
              playerName={playerName}
              setPlayerName={setPlayerName}
              playerAvatar={playerAvatar}
              setPlayerAvatar={setPlayerAvatar}
              activeRoomId={activeRoomId}
              onNavigateCreate={() => setCurrentView("create")}
              onNavigateJoin={(code) => {
                if (code) setActiveRoomId(code);
                setCurrentView("join");
              }}
              isConnected={isConnected}
              isDemoMode={isDemoMode}
              setIsDemoMode={setIsDemoMode}
            />
          )}

          {currentView === "create" && (
            <CreateQuiz
              onBack={() => setCurrentView("home")}
              onCreate={handleCreateRoom}
              playerName={playerName}
              setPlayerName={setPlayerName}
              playerAvatar={playerAvatar}
              setPlayerAvatar={setPlayerAvatar}
              isLoading={isLoading}
            />
          )}

          {currentView === "join" && (
            <JoinQuiz
              onBack={() => setCurrentView("home")}
              onJoin={handleJoinRoom}
              playerName={playerName}
              setPlayerName={setPlayerName}
              playerAvatar={playerAvatar}
              setPlayerAvatar={setPlayerAvatar}
              initialRoomId={activeRoomId}
              isLoading={isLoading}
            />
          )}

          {currentView === "waiting" && (
            <WaitingRoom
              room={roomData}
              isHost={userRole === "host"}
              onStartQuiz={handleStartQuiz}
              onLeaveRoom={handleLeaveRoom}
              isStarting={isRoomStarting}
            />
          )}

          {currentView === "quiz" && (
            <QuizGame
              room={roomData}
              currentQuestion={currentQuestion}
              timeLeft={questionTimeLeft}
              maxTime={roomData?.quizSettings?.timePerQuestion || 10}
              userRole={userRole}
              playerId={playerId}
              onAnswer={handleSubmitAnswer}
              onExit={handleLeaveRoom}
              answerFeedback={answerFeedback}
              opponentAnswered={opponentAnswered}
              isIntermission={isIntermission}
              intermissionData={intermissionData}
              opponentDisconnected={opponentDisconnected}
            />
          )}

          {currentView === "result" && (
            <QuizResult
              resultData={finalResult}
              userRole={userRole}
              onPlayAgain={handlePlayAgain}
              onCreateNewRoom={() => setCurrentView("create")}
              onReturnHome={handleReturnHome}
            />
          )}
        </main>
      </div>
    </div>
  );
}
