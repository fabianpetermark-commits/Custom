import logging
import logging.config
from pathlib import Path

# Ensure logs directory exists
p = Path("logs")
if not p.exists():
    p.mkdir()

# Logging configuration
dictConfig = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s:: %(message)s',
        },
    },
    'handlers': {
        'default': {
            'level': 'INFO',
            'formatter': 'standard',
            'class': 'logging.StreamHandler',
            'stream': 'ext://sys.stdout',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'DEBUG',
            'formatter': 'standard',
            'filename': 'logs/logfile.log',
            'mode': 'a',
            'maxBytes': 5242880,
            'backupCount': 3,
            'encoding': 'utf-8',
        },
        'ocr_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'INFO',
            'formatter': 'standard',
            'filename': 'logs/ocr_log.log',
            'mode': 'a',
            'maxBytes': 5242880,
            'backupCount': 3,
            'encoding': 'utf-8',
        },
    },
    'loggers': {
        '__main__': {
            'handlers': ['default', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'camera': {
            'handlers': ['default', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'ocr': {
            'handlers': ['default', 'ocr_file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Apply logging configuration
logging.config.dictConfig(dictConfig)