import { useEffect, useState } from "react"
import "./App.css"

const morseCodeMap: Record<string, string> = {
    "0": "-----",
    "1": ".----",
    "2": "..---",
    "3": "...--",
    "4": "....-",
    "5": ".....",
    "6": "-....",
    "7": "--...",
    "8": "---..",
    "9": "----.",
}

const transformToMorseCode = (time: string) => {
    const [hour, min, s] = time.split(":").map(t => {
        return t
            .split("")
            .map(char => {
                if (char === ":") {
                    return ":"
                }
                return morseCodeMap[char]
            })
            .join(" ")
    })

    return { hour, min, s }
}

function App() {
    const DOT_TIME = 60
    const DASH_TIME = DOT_TIME * 3
    const SYMBOL_BREAK = DOT_TIME
    const LETTER_BREAK = DOT_TIME * 3
    const WORD_BREAK = DOT_TIME * 7

    const audioCtx = new AudioContext()
    const oscNode = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscNode.type = "sine"
    oscNode.frequency.value = 800
    gainNode.gain.value = 0

    oscNode.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    oscNode.start()

    const startAudio = () => {
        gainNode.gain.setTargetAtTime(0.1, 0, 0.001)
    }

    const stopAudio = () => {
        gainNode.gain.setTargetAtTime(0, 0, 0.001)
    }

    const sleep = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    const playDot = async () => {
        // if (currentPlayCounter != playCounter) { return; }
        startAudio()
        await sleep(DOT_TIME)
        stopAudio()
    }

    const playDash = async () => {
        // if (currentPlayCounter != playCounter) { return; }
        startAudio()
        await sleep(DASH_TIME)
        stopAudio()
    }

    const [time, setTime] = useState(transformToMorseCode("00:00:00"))
    const [frozenTime, setFrozenTime] = useState("")
    const [currentlyPlaying, setCurrentlyPlaying] = useState(false)

    const fireBeeps = async () => {
        if (currentlyPlaying) {
            return
        }

        setCurrentlyPlaying(true)

        const currentTime = Object.values(time)

        for (let i = 0; i < 3; i++) {
            const b = currentTime[i].split("")
            for (let j = 0; j < b.length; j++) {
                if (b[i] === ".") {
                    await playDot()
                } else if (b[i] === "-") {
                    await playDash()
                }
                await sleep(SYMBOL_BREAK)
            }
            await sleep(LETTER_BREAK)
        }

        setFrozenTime("")
        setCurrentlyPlaying(false)
    }

    const loopyLoop = setInterval(() => {
        setTime(
            transformToMorseCode(
                new Date().toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }),
            ),
        )
        // console.log(time, typeof time)
    }, 1000)

    useEffect(() => {
        return () => {
            clearInterval(loopyLoop)
        }
    }, [])

    return (
        <div>
            <div className="flex gap-2">
                <code>
                    <h1 className="text">Hour {time.hour}</h1>
                </code>
                <code>
                    <h1 className="text">Minute {time.min}</h1>
                </code>
                <code>
                    <h1 className="text">Seconds {time.s}</h1>
                </code>
            </div>
            <button
                onClick={() => {
                    setFrozenTime(
                        time.hour + "  :  " + time.min + "  :  " + time.s,
                    )
                    fireBeeps()
                }}
                className="btn">
                Play Current Beeps
            </button>

            <h1 className="text">{frozenTime ?? ""}</h1>
        </div>
    )
}

export default App
