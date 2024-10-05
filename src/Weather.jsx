import './App.css';
import React, { useEffect, useState, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { Line } from 'react-chartjs-2';
import useOutsideClick from './hook/useOutsideClick';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function Weather() {
    const [query, setQuery] = useState('');
    const [city, setCity] = useState(localStorage.getItem('city') || 'Paris');
    const [suggestions, setSuggestions] = useState([]);
    const [weatherData, setWeatherData] = useState([]);
    const [forecastData, setForecastData] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const wrapperRef = useRef(null);

    useOutsideClick(wrapperRef, () => setSuggestions([]));

    useEffect(() => {
        if (query.length > 2) {
            fetch(`https://api-adresse.data.gouv.fr/search/?q=${query}`)
                .then(response => response.json())
                .then(data => {
                    const citySuggestions = data.features
                        .filter(feature => feature.properties.type === 'municipality')
                        .map(feature => feature.properties.name);
                    setSuggestions(citySuggestions);
                })
                .catch(error => console.error('Error fetching city data:', error));
        } else {
            setSuggestions([]);
        }
    }, [query]);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=caefd044204e11b3527362295135047e&units=metric&lang=fr`);
                const data = await response.json();
                const dailyData = data.list.filter((reading) => reading.dt_txt.includes("12:00:00"));
                setWeatherData(dailyData);
                setForecastData(data.list);
                if (data.list.length > 0) {
                    setSelectedDay(new Date(data.list[0].dt_txt).toLocaleDateString());
                }
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        fetchWeather();
    }, [city]);

    const handleCitySelect = (selectedCity) => {
        setCity(selectedCity);
        setQuery(selectedCity);
        setSuggestions([]);
        localStorage.setItem('city', selectedCity);
    };

    const handleDayClick = (day) => {
        setSelectedDay(day);
    };

    const getHourlyDataForSelectedDay = () => {
        if (!forecastData || !selectedDay) return null;

        const dayData = forecastData.filter(reading =>
            new Date(reading.dt_txt).toLocaleDateString() === selectedDay
        );

        if (dayData.length === 0) {
            return null;
        }

        return {
            labels: dayData.map(reading => new Date(reading.dt_txt).getHours() + 'h'),
            datasets: [
                {
                    type: 'line',
                    label: 'Température (°C)',
                    data: dayData.map(reading => reading.main.temp),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                    yAxisID: 'y1',
                },
                {
                    type: 'line',
                    label: 'Humidité (%)',
                    data: dayData.map(reading => reading.main.humidity),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                    yAxisID: 'y1',
                },
                {
                    type: 'bar',
                    label: 'Précipitations (mm)',
                    data: dayData.map(reading => reading.rain ? reading.rain['3h'] : 0),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    yAxisID: 'y2',
                },
            ],
        };
    };

    return (
        <div className='grid grid-cols-5 grid-rows-[auto,auto,1fr] gap-3 h-screen w-screen p-3 bg-slate-100'>
            <div className='bg-white p-2 col-span-5 gap-3 flex flex-col lg:flex-row justify-between items-center rounded-lg'>
                <div className='text-xl'>{city}</div>
                <div ref={wrapperRef} className='relative w-4/5'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                        type='text'
                        className='border border-gray-400 rounded-sm pl-10 w-full'
                        placeholder='Search...'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {suggestions.length > 0 && (
                        <ul className='absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto'>
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    className='p-2 hover:bg-gray-200 cursor-pointer'
                                    onClick={() => handleCitySelect(suggestion)}
                                >
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            {weatherData.map((forecast, index) => (
                <div key={index} className='bg-white p-2 h-auto flex flex-row justify-around items-center rounded-lg cursor-pointer' onClick={() => handleDayClick(new Date(forecast.dt_txt).toLocaleDateString())}>
                    <img
                        src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                        alt='Weather icon'
                        className='h-20 w-20'
                    />
                    <div>
                        <div>{new Date(forecast.dt_txt).toLocaleDateString()}</div>
                        <div>Temps: {forecast.main.temp}°C</div>
                        <div>Humidité: {forecast.main.humidity}%</div>
                        <div>Vent: {forecast.wind.speed} km/h</div>
                        <div>Pression: {forecast.main.pressure} hPa</div>
                    </div>
                </div>
            ))}
            <div className='bg-white p-2 col-span-5 flex-grow rounded-xl overflow-y-auto'>
                {forecastData && selectedDay && getHourlyDataForSelectedDay() ? (
                    <Line
                        data={getHourlyDataForSelectedDay()}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: `Données horaires pour ${selectedDay}`,
                                },
                            },
                            scales: {
                                x: {
                                    beginAtZero: true,
                                },
                                y1: {
                                    type: 'linear',
                                    position: 'left',
                                    beginAtZero: true,
                                },
                                y2: {
                                    type: 'linear',
                                    position: 'right',
                                    beginAtZero: true,
                                    grid: {
                                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                                    },
                                },
                            },
                        }}
                        height={400}
                    />
                ) : (
                    <div>Chargement des données...</div>
                )}
            </div>
        </div>
    );
}

export default Weather;
