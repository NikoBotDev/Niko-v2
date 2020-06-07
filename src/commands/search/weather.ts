import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { stringify } from 'querystring';
import axios from 'axios';

import colors from '~/config/colors';

type Timestamp = number;

interface WeatherAPIResponse {
  id: number;
  name: string;
  sys: {
    country: string;
    sunset: Timestamp;
    sunrise: Timestamp;
  };
  weather: [
    {
      description: string;
      main: string;
      icon: string;
    }
  ];
  main: {
    humidity: number;
    temp: number;
    temp_max: number;
    temp_min: number;
  };
  wind: {
    speed: number;
  };
  coord: {
    lat: number;
    lon: number;
  };
}

export default class WeatherCommand extends Command {
  constructor() {
    super('weather', {
      aliases: ['weather'],
      category: 'search',
      clientPermissions: ['EMBED_LINKS'],
      description: {
        content: 'Get weather data for your city.',
        usage: '<city name>',
        examples: ['Londres, UK', 'New York'],
      },
      args: [
        {
          id: 'city',
          description: 'City to fetch the weather data.',
          match: 'content',
          prompt: {
            start: 'What city you want to see weather data?\n',
          },
        },
      ],
    });
  }

  public async exec(message: Message, { city }: { city: string }) {
    try {
      const data = await this.getWeather(city);
      const {
        data: {
          id,
          name,
          sys: { country },
          coord: { lat, lon },
          weather,
          main: { humidity, temp, temp_max, temp_min },
          wind: { speed },
        },
        sunset,
        sunrise,
      } = data;
      const embed = new MessageEmbed()
        .setColor(colors.success)
        .addField(
          '🌎 Location',
          `[${name}, ${country}](https://openweathermap.org/city/${id})`,
          true
        )
        .addField('🔎 Lat/Lon', `${lat}/${lon}`, true)
        .addField('☁ Condition', weather[0].main, true)
        .addField('💧 Humidity', `${humidity} %`, true)
        .addField('💨 Wind Speed', `${speed} m/s`, true)
        .addField('🌡 Temperature', `${temp} °C`, true)
        .addField('☀ Min/Max', `${temp_min} °C - ${temp_max} °C`, true)
        .addField('🌅 Sunset', sunset, true)
        .addField('🌄 Sunrise', sunrise, true)
        .setFooter(
          weather[0].description,
          `http://openweathermap.org/img/w/${weather[0].icon}.png`
        );
      message.util!.send('', embed);
    } catch (err) {
      console.error(err);
    }
  }

  private async getWeather(city: string) {
    const query = stringify({
      q: city,
      appid: process.env.WEATHER_KEY,
      units: 'metric',
    });
    const response = await axios.get<WeatherAPIResponse>(
      `http://api.openweathermap.org/data/2.5/weather?${query}`
    );
    if (response.status === 404) {
      return Promise.reject(`The ${city} cannot be found...`);
    }

    const sunrise = this.getFormattedTime(response.data.sys.sunrise);
    const sunset = this.getFormattedTime(response.data.sys.sunset);
    return { data: response.data, sunrise, sunset };
  }

  private getFormattedTime(time: number) {
    return `${new Date(time * 1000).toTimeString().split(' ')[0]} UTC`;
  }
}
