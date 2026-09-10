import json
import numpy as np
from scipy.io import wavfile
from scipy import signal
import subprocess
import os
import tempfile

# Пути
AUDIO_FILE = '/Volumes/ID/Скрипты/Проект/Сайт/Mate/Audio/Mate - Echoes of Dusk (Extended Mix).mp3'
OUTPUT_FILE = '/Volumes/ID/Скрипты/Проект/Сайт/Mate/waveform.json'
NUM_BARS = 200  # Количество столбцов волны

# Конвертация MP3 в WAV через afconvert (macOS)
def convert_to_wav(mp3_path):
    wav_path = tempfile.mktemp(suffix='.wav')
    cmd = ['afconvert', '-f', 'WAVE', '-d', 'LEI16', mp3_path, wav_path]
    subprocess.run(cmd, check=True, capture_output=True)
    return wav_path

# Чтение WAV
def read_wav(wav_path):
    rate, data = wavfile.read(wav_path)
    # Если стерео, берём среднее каналов
    if len(data.shape) > 1:
        data = data.mean(axis=1)
    return rate, data.astype(np.float32) / 32768.0

# Нормализация пиков
def normalize_peaks(peaks):
    max_peak = np.max(peaks)
    if max_peak > 0:
        peaks = peaks / max_peak
    return peaks

# Основная функция
def generate_waveform():
    print('Конвертация MP3 в WAV...')
    wav_path = convert_to_wav(AUDIO_FILE)
    
    print('Чтение аудио...')
    rate, audio_data = read_wav(wav_path)
    print(f'Частота: {rate}Hz, Длина: {len(audio_data)/rate:.1f} сек')
    
    # Вычисление RMS для каждого сегмента
    segment_length = len(audio_data) // NUM_BARS
    peaks = []
    
    print('Анализ пиков...')
    for i in range(NUM_BARS):
        start = i * segment_length
        end = min((i + 1) * segment_length, len(audio_data))
        segment = audio_data[start:end]
        if len(segment) > 0:
            rms = np.sqrt(np.mean(segment ** 2))
            peaks.append(float(rms))
        else:
            peaks.append(0.0)
    
    # Нормализация
    peaks = normalize_peaks(np.array(peaks))
    
    # Усиление малых значений для лучшей видимости
    peaks = np.power(peaks, 0.7)
    peaks = normalize_peaks(peaks)
    
    # Сохранение в JSON
    print('Сохранение waveform.json...')
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(peaks.tolist(), f)
    
    # Очистка
    os.remove(wav_path)
    print('Готово!')

if __name__ == '__main__':
    generate_waveform()
