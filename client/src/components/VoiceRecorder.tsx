import React, { useState, useRef, useEffect } from "react"
import { Mic, Pause, Play, Send, Square, Trash } from "lucide-react"

const VoiceRecorder = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioData, setAudioData] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioLevel, setAudioLevel] = useState(Array(20).fill(0))
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [lastVisualization, setLastVisualization] = useState(Array(20).fill(0))

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const animationFrameRef = useRef()
  const analyserRef = useRef(null)
  const audioRef = useRef(null)
  const streamRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setIsDropdownOpen(true)
      setDuration(0)
      startAudioVisualization()
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      setLastVisualization(audioLevel)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      startAudioVisualization()
    }
  }

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        })
        const url = URL.createObjectURL(audioBlob)
        setAudioData(audioBlob)
        setAudioUrl(url)
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      setIsRecording(false)
      setIsPaused(false)
      setLastVisualization(audioLevel)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  const startAudioVisualization = () => {
    const analyser = analyserRef.current
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const updateVisualizer = () => {
      analyser.getByteFrequencyData(dataArray)
      const normalizedData = Array.from(dataArray)
        .map((value) => value / 255)
        .slice(0, 20)
        .reverse()
      setAudioLevel(normalizedData)
      animationFrameRef.current = requestAnimationFrame(updateVisualizer)
    }

    updateVisualizer()
  }

  const handleSend = () => {
    if (audioData) {
      onSend(audioData)
      resetRecorder()
    }
  }

  const resetRecorder = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioData(null)
    setAudioUrl(null)
    setDuration(0)
    setIsDropdownOpen(false)
    setAudioLevel(Array(20).fill(0))
    setLastVisualization(Array(20).fill(0))
    audioChunksRef.current = []
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [audioUrl])

  useEffect(() => {
    let interval
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording, isPaused])

  return (
    <div className="relative">
      <button
        onClick={
          isRecording
            ? () => setIsDropdownOpen(!isDropdownOpen)
            : startRecording
        }
        className="p-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
      >
        <Mic className="w-6 h-6 text-white" />
      </button>

      {isDropdownOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-96 bg-white rounded-lg shadow-lg p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-center h-12 space-x-2">
              {(isPaused ? lastVisualization : audioLevel).map(
                (level, index) => (
                  <div
                    key={index}
                    className="w-1 bg-red-500 rounded-full transition-all duration-100"
                    style={{ height: `${level * 100}%` }}
                  />
                )
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {Math.floor(duration / 60)}:
                {String(duration % 60).padStart(2, "0")}
              </span>

              <div className="flex items-center space-x-3">
                {isRecording ? (
                  <>
                    {isPaused ? (
                      <Play
                        className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800"
                        onClick={resumeRecording}
                      />
                    ) : (
                      <Pause
                        className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800"
                        onClick={pauseRecording}
                      />
                    )}
                    <Square
                      className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800"
                      onClick={stopRecording}
                    />
                  </>
                ) : (
                  audioData && (
                    <>
                      <Trash
                        className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800"
                        onClick={resetRecorder}
                      />
                      <Send
                        className="w-6 h-6 text-blue-500 cursor-pointer hover:text-blue-600"
                        onClick={handleSend}
                      />
                    </>
                  )
                )}
              </div>
            </div>

            {audioData && (
              <div className="pt-2 rounded-md overflow-hidden bg-gray-50">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  className="w-full"
                  onLoadedMetadata={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = 0
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceRecorder
