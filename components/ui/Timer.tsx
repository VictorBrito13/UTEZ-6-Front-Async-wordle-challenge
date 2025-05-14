import { UI_Colors } from "@/constants/Colors";
import { GAME_DURATION } from "@/constants/game.constants";
import { useAuth } from "@/context/auth/authContext";
import { finishGame } from "@/helpers/http/finishGame";
import React, { useEffect, useRef, useState } from "react";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

export const Timer = React.memo(
  function Timer({ isInProgress, setGameProps, shouldRestart, setShouldRestartTimer }: { isInProgress: boolean, setGameProps: Function, shouldRestart: boolean, setShouldRestartTimer: Function }) {
    const timerIdRef = useRef<number | undefined>(undefined);
    const [timer, setTimer] = useState(GAME_DURATION);
    const { authToken } = useAuth();

    useEffect(() => {
      if (shouldRestart) {
        setTimer(GAME_DURATION);
        timerIdRef.current = undefined;
        setShouldRestartTimer(false);
      }
    }, [shouldRestart]);

    // Set timmer
    useEffect(() => {
      console.log('Ejecutando efect del timmer');
      console.log(isInProgress);
      if (isInProgress) {
        timerIdRef.current = setInterval(() => {
          setTimer(prev => {
            let time = prev - 1000;
            // Stop the game when the time is 0
            if (time <= 0) {
              // finish the game
              (async () => {
                const response = await finishGame(authToken);
                setGameProps({
                  completeGameMsg: response.message,
                  isInProgress: false
                });
              })();

              console.log(timerIdRef.current);

              if (timerIdRef.current) {
                console.log('Limpiando el timer con ID:', timerIdRef.current);
                clearInterval(timerIdRef.current);
                timerIdRef.current = undefined; // Reset the ref
              } else {
                console.log('No hay timer para limpiar.');
              }

              return 0;
            }
            return time;
          });
        }, 1000);
      }

      return () => {
        if (timerIdRef.current) {
          console.log('Limpiando el timer con ID:', timerIdRef.current);
          clearInterval(timerIdRef.current);
          timerIdRef.current = undefined; // Reset the ref
        } else {
          console.log('No hay timer para limpiar.');
        }
      }
    }, [isInProgress]);

    function formatTime(milliseconds: number): string {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = Math.floor((milliseconds % 60000) / 1000);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return (
      <ThemedView className='w-1/4' style={{ backgroundColor: UI_Colors.RED, borderRadius: 4 }}>
        <ThemedText className='text-center p-4' style={{ color: UI_Colors.WHITE }}>
          Time left {formatTime(timer)}
        </ThemedText>
      </ThemedView>
    );
  }
);