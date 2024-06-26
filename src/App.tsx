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

    const [time, setTime] = useState(transformToMorseCode("00:00:00"))
    const [frozenTime, setFrozenTime] = useState("")
    const [currentlyPlaying, setCurrentlyPlaying] = useState(false)

    let oscNode
    let gainNode

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
        startAudio()
        await sleep(DOT_TIME)
        stopAudio()
    }

    const playDash = async () => {
        startAudio()
        await sleep(DASH_TIME)
        stopAudio()
    }

    const fireBeeps = async () => {
        if (currentlyPlaying) {
            return
        }

        // S/o @alexanderellis on GH for creating an example of how to use the Web Audio API
        // to create a simple morse code beeping sound effect https://alexanderell.is/posts/writing-morse-code-games/
        const audioCtx = new AudioContext()
        oscNode = audioCtx.createOscillator()
        gainNode = audioCtx.createGain()

        oscNode.type = "sine"
        oscNode.frequency.value = 400
        gainNode.gain.value = 0

        oscNode.connect(gainNode)
        gainNode.connect(audioCtx.destination)
        oscNode.start()

        setFrozenTime(time.hour + "  :  " + time.min + "  :  " + time.s)
        setCurrentlyPlaying(true)

        const currentTime = Object.values(time)

        for (let i = 0; i < 3; i++) {
            const b = currentTime[i].split("")
            for (let j = 0; j < b.length; j++) {
                if (b[j] === ".") {
                    // console.log("dot", j)
                    await playDot()
                } else if (b[j] === "-") {
                    // console.log("dash", j)
                    await playDash()
                }
                await sleep(SYMBOL_BREAK)
            }
            await sleep(LETTER_BREAK)
        }

        setFrozenTime("")
        setCurrentlyPlaying(false)

        oscNode.stop()
        oscNode.disconnect()
        gainNode.disconnect()
        audioCtx.close()
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
    }, 1000)

    useEffect(() => {
        return () => {
            clearInterval(loopyLoop)
        }
    }, [])

    return (
        <div>
            <div className="center">
                <div className="header">
                    <h1>Morse Code Clock</h1>
                    <h1 className="info">
                        ?
                        <span className="infotext">
                            Morse code cheatsheet:
                            <ul>
                                <li>0: -----</li>
                                <li>1: .----</li>
                                <li>2: ..---</li>
                                <li>3: ...--</li>
                                <li>4: ....-</li>
                                <li>5: .....</li>
                                <li>6: -....</li>
                                <li>7: --...</li>
                                <li>8: ---..</li>
                                <li>9: ----.</li>
                            </ul>
                        </span>
                    </h1>
                </div>

                <code className="unit">
                    <h1>Hours</h1>
                    <h1>{time.hour}</h1>
                </code>
                <code className="unit">
                    <h1>Minutes</h1>
                    <h1>{time.min}</h1>
                </code>
                <code className="unit">
                    <h1>Seconds</h1>
                    <h1>{time.s}</h1>
                </code>
                <button
                    onClick={() => {
                        fireBeeps()
                    }}
                    className="btn">
                    Play Current Beeps
                </button>
            </div>

            <code>
                {frozenTime ? (
                    <h1>{frozenTime}</h1>
                ) : (
                    <h1 className="playing">
                        ----- ----- : ----- ----- : ----- -----
                    </h1>
                )}
            </code>
        </div>
    )
}

export default App
