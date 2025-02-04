import React, { useEffect, useState } from 'react';

import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useContext } from 'react';
import { UserContext } from '../../store/context';
import { useDisconnect } from 'wagmi';
import { sendBuyTokens, sendUseTickets } from '../../util/send';

const WaitingRoom = () => {
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();
  const { disconnect } = useDisconnect();
  const {
    ticket_count,
    reward_ticket,
    lose_count,
    win_count,
    stateReset,
    stateView,
    setTicketCount,
  } = useContext(UserContext);
  const [winningRate, setWinningRate] = useState(0);

  // 커넥트되지 않았을 경우
  useEffect(() => {
    if (!isConnected) {
      disconnect();
      stateReset();
      stateView();
      navigate('/');
    }
  }, [isConnected, navigate]);

  // 승리수와 패배수 변경시
  useEffect(() => {
    // 승률 state 변경
    setWinningRate(winingRate(win_count, lose_count));
    stateView();
  }, [win_count, lose_count]);

  // 게임 시작 누를시
  async function handleGameStartButtonEvent(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    // 티켓이 있을 경우에만 플레이 가능하게하기
    if (ticket_count > 0) {
      try {
        // ticket use 요청
        const result = await sendUseTickets(address, 1, true);
        if (result.data.result === false) {
          Swal.fire(`${result.data.msg}`);
        } else {
          setTicketCount(ticket_count - 1);
          navigate('/playgrounds');
        }
      } catch (err) {
        Swal.fire(`${err}`);
      }
    } else {
      Swal.fire('Please buy a ticket');
    }
  }

  function handleTokenBuyButtonEvent(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    // 토큰 사려할때 버튼 이벤트
    Swal.fire({
      title: 'How many tickets will you buy?',
      icon: 'question',
      input: 'range',
      inputAttributes: {
        min: '1',
        max: '120',
        step: '1',
      },
      inputValue: 10,
      //
    }).then(async (res) => {
      // 토큰 사기 확인 버튼
      if (res.isConfirmed === true) {
        console.log('but tokens');
        console.log(res);
        try {
          const result = await sendBuyTokens(address, res.value);
          console.log(result);
          if (result) {
            Swal.fire(`${result.data.msg}`);
            setTicketCount(ticket_count + parseInt(res.value));
          }
        } catch (error) {
          return Swal.fire(`${error}`);
        }
      }
    });
  }

  // 승률 처리
  function winingRate(winCount: number, loseCount: number): number {
    if (winCount + loseCount === 0) {
      return 0;
    } else {
      return (winCount / (winCount + loseCount)) * 100;
    }
  }

  return (
    <div className='flex flex-col w-8/12 bg-slate-600 justify-center mt-12'>
      <div className='flex flex-col w-full bg-slate-50 justify-center text-center align-middle h-screen'>
        <div className='text-2xl m-8'>
          <h1>Your Ticket Number {ticket_count}</h1>
          <h1 className='mt-10'>
            Victory {win_count} & Defeat {lose_count}
          </h1>
          <h1 className='mt-10'>Winning Rate {winningRate}%</h1>
          <h1 className='mt-10'>Reward Ticket {reward_ticket}</h1>
        </div>
        <div className='flex flex-col items-center'>
          <button
            className='bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-50 m-5'
            onClick={handleTokenBuyButtonEvent}
          >
            티켓 구매하기
          </button>
          {/* 토큰 상태별로 분기처리 */}
          {ticket_count > 2 && (
            <button
              className='bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-50'
              onClick={handleGameStartButtonEvent}
            >
              게임시작
            </button>
          )}

          {reward_ticket > 0 && (
            <button
              className='bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-50 mt-5'
              // onClick={}
            >
              보상 요청하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
