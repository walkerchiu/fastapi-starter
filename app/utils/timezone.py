from datetime import datetime
import zoneinfo

from app.core.conf import settings


class TimeZone:
    def __init__(self, tz: str = settings.DATETIME_TIMEZONE):
        """
        Initialize TimeZone with a specific timezone.

        Args:
        - tz (str): Timezone name. Defaults to settings.DATETIME_TIMEZONE.
        """
        self.tz_info = zoneinfo.ZoneInfo(tz)

    def now(self) -> datetime:
        """
        Get the current datetime in the specified timezone.

        Returns:
        - datetime: Current datetime in the specified timezone.
        """
        return datetime.now(self.tz_info)


timezone = TimeZone()
