from setuptools import setup, find_packages
from pathlib import Path

here = Path(__file__).parent
long_description = ""
readme = here / "assistant" / "README.md"
if readme.exists():
    long_description = readme.read_text(encoding="utf-8")

install_requires = [
    "SpeechRecognition>=3.8.1",
    "pyttsx3>=2.90",
    "requests>=2.28",
    "pyaudio>=0.2.11",
    "spacy>=3.0",
    "pocketsphinx>=0.1.15",
]

setup(
    name="jarvis-assistant",
    version="0.1.0",
    description="Modular voice assistant (wake-word, STT, NLP, TTS)",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=find_packages(exclude=("tests",)),
    include_package_data=True,
    install_requires=install_requires,
    entry_points={
        "console_scripts": [
            "jarvis-assistant=assistant.main:main",
        ],
    },
    python_requires=">=3.8",
)
