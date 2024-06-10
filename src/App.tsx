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
    const [time, setTime] = useState(transformToMorseCode("00:00:00"))

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
        </div>
    )
}

export default App
