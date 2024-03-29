'use client'

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation'

import Loading from '../../components/Loading';
import * as echarts from 'echarts';

import { setNotification, getNotification } from "../../utils/notification";

import { User } from '../layout';

export default function Page() {
    const inpStyle = "outline-none rounded-md px-3 py-3 shadow-2xl shadow-slate-950 text-slate-400 bg-transparent";
    const { loggedin, userData, respHook } = User();
    const [team, setTeam] = useState({});
    const [chart, setChart] = useState(null);
    const [pie, setPie] = useState(null);
    const router = useRouter();

    const [chartData, setChartData] = useState([]);
    const [solvedData, setSolvedData] = useState({ solved: 0, unsolved: 21 });

    const [cap, setCap] = useState(null);

    useEffect(() => {
        if (loggedin) {
            var chart = document.getElementById('chart');
            var solved = document.getElementById('solved')

            if (chart) {
                const myChart = echarts.init(chart, 'dark');
                setChart(myChart);
            }

            if (solved) {
                const myChart = echarts.init(solved, 'dark');
                setPie(myChart);
            }
        }
    }, [loggedin])

    useEffect(() => {
        if (chart) {
            chart.setOption({
                title: {},
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params) {
                        params = params[0].value[0];
                        return `T+${Math.floor(params / 3600).toString().padStart(2, '0')}:${Math.floor((params % 3600) / 60).toString().padStart(2, '0')}:${((params % 3600) % 60).toString().padStart(2, '0')}`;
                    }
                },
                xAxis: {
                    axisLabel: {
                        formatter: function (params) {
                            return `T+${(params / 3600).toFixed().padStart(2, '0')}:${((params % 3600) / 60).toFixed().padStart(2, '0')}:${((params % 3600) % 60).toFixed().padStart(2, '0')}`;
                        }
                    }
                },
                yAxis: {},
                series: [
                {
                    name: 'Score',
                    type: 'line',
                    data: chartData
                }
                ]
            });
        }
    }, [chart, chartData])

    useEffect(() => {
        if (pie) {
            pie.setOption({
                title: {
                text: 'Team progress',
                left: 'center',
                top: 'center'
                },
                series: [
                {
                    type: 'pie',
                    emphasis: {
                        label: {
                        show: true,
                        fontSize: '15',
                        fontWeight: 'bold'
                        }
                    },
                    data: [
                        {
                            value: solvedData.solved,
                            name: `Solved(${solvedData.solved})`
                        }, {
                            value: solvedData.unsolved,
                            name: `Unsolved(${solvedData.unsolved})`
                        }
                    ],
                    radius: ['50%', '70%']
                }
                ]
            });
        }
    }, [pie, solvedData])

    const handleCreate = async () => {
        const teamname = (document.getElementById("teamname") as HTMLInputElement).value;
        const secret = (document.getElementById("secret") as HTMLInputElement).value;

        const data = await toast.promise(fetch("/api/user/createteam", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${Cookies.get('token')}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                teamname, secret
            })
        }), {
            pending: "Creating team..."
        });

        const jsonData = await data.json();

        if (jsonData.status == "fail") {
            toast.error(jsonData.error);
        } else {
            setNotification(true, "success", "You just took control of your ship");
            location.reload();
        }
    }

    const handleJoin = async () => {
        const teamname = (document.getElementById("teamname") as HTMLInputElement).value;
        const secret = (document.getElementById("secret") as HTMLInputElement).value;

        const data = await toast.promise(fetch("/api/user/jointeam", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${Cookies.get('token')}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                teamname, secret
            })
        }), {
            pending: "Joining team..."
        });

        const jsonData = await data.json();

        if (jsonData.status == "fail") {
            toast.error(jsonData.error);
        } else {
            setNotification(true, "success", "You just joined a team!");
            location.reload();
        }
    }

    const handleLeave = async () => {
        const data = await toast.promise(fetch("/api/user/leaveteam", {
            headers: {
                "Authorization": `Bearer ${Cookies.get('token')}`,
            }
        }), {
            pending: "Leaving team..."
        });

        const jsonData = await data.json();

        if (jsonData.status == "fail") {
            if (jsonData.error == "CANNOT_LEAVE_TEAM_AFTER_EVENT_STARTS") {
                return toast.error("You cannot leave team once the event has started")
            }
            toast.error(jsonData.error);
        } else if (jsonData.status == "info") {
            setNotification(true, "warn", "The team was deleted since you were the captain");
            location.reload();
        } else {
            setNotification(true, "success", "You left the team");
            location.reload();
        }
    }

    const getTeamInfo = async () => {
        const data = await fetch("/api/user/teaminfo", {
            headers: {
                "Authorization": `Bearer ${Cookies.get('token')}`
            }
        });
        const jsonData = await data.json();
        if (jsonData.status == "success") {
            setTeam(jsonData.data);
            setChartData(jsonData.team_scores);
            setSolvedData(jsonData.solves);
            setCap(jsonData.captain_id);
        }
    }

    useEffect(() => {
        if (respHook && !loggedin) {
            setNotification(true, "info", "Please login first");
            router.push("/login");
        } else {
            getTeamInfo();
        }
    }, [respHook])

    useEffect(() => {
        const {toShow, type, message} = getNotification();
        if (toShow === "true") {
            switch (type) {
                case "info":
                    toast.info(message);
                    break;
                case "success":
                    toast.success(message);
                    break;
                case "warn":
                    toast.warn(message);
                    break;
                case "error":
                    toast.error(message);
                default:
                    toast(message);
                    break;
            }
            setNotification();
        }
    }, [])

    return(
        loggedin ?
        userData.teamname == null ?
        <div className="flex absolute justify-center items-center w-full h-full min-h-full bg-slate-900 gap-10">
            <div className="h-96 w-96 bg-cover rounded-xl z-10">
                <div className="w-full h-full bg-planets bg-s bg-cover bg-center rounded-md"></div>
            </div>
            <div className='flex flex-col gap-3'>
                <p className="text-center text-3xl font-bold text-slate-400">JOIN / CREATE TEAM</p>
                <hr className="border-slate-500"></hr>
                <input className={inpStyle} id='teamname' name='teamname' placeholder='Team Name'></input>
                <input className={inpStyle} id='secret' name='secret' placeholder='Team Secret' type='password'></input>
                <div className='flex justify-center gap-3 w-full'>
                    <button onClick={handleJoin} className="bg-violet-600 text-white p-3 w-1/2 rounded-md shadow-lg shadow-violet-500/50 grow">Join</button>
                    <button onClick={handleCreate} className="bg-violet-600 text-white p-3 w-1/2 rounded-md shadow-lg shadow-violet-500/50 grow">Create</button>
                </div>
            </div>
        </div> : <div className='flex absolute justify-center items-center w-full h-full min-h-full bg-slate-900'>
            <div className='flex flex-col gap-3'>
                <p className='text-slate-400 text-4xl font-bold'>{userData.teamname}</p>
                <div className='flex gap-3 mt-4'>
                {
                    Object.keys(team).map((i) => <div className='text-slate-300 px-3 py-2 bg-slate-800 rounded-md'key={i}>{ cap == team[i].uid ? <div className='absolute -translate-y-7 -translate-x-4 w-8 h-8 bg-captain bg-contain bg-center bg-no-repeat rounded-full'></div> : <></> }{team[i].username}</div>)
                }
                </div>
                <div className='flex gap-5'>
                    <div id='chart' className='bg-slate-800 rounded-lg' style={{ height: "350px", width: "700px" }}></div>
                    <div id='solved' className='bg-slate-800 rounded-lg' style={{ height: "350px", width: "400px" }}></div>
                </div>
                <button onClick={handleLeave} className='bg-violet-600 text-white p-2 w-32 rounded-md shadow-md shadow-violet-500/50 grow'>Leave Team</button>
            </div>
        </div> : <div className='text-center text-3xl font-bold text-slate-400'>
            <Loading text=""></Loading>
        </div>
    )
}