import { useTranslation } from 'react-i18next';

export default function AnnouncementBar() {
  const { t } = useTranslation();
  return (
    <div
      className="w-full py-2 px-4 flex items-center justify-between text-xs font-semibold"
      style={{ background: '#2C1810', color: '#F19A0E' }}
    >
      <span className="flex items-center gap-2">
        🇪🇹 {t('announcement.made')}
        <span className="hidden sm:inline text-[#F19A0E]/60 mx-1">|</span>
        <span className="hidden sm:inline text-[#F19A0E]/80">{t('announcement.tagline')}</span>
      </span>
      <span className="flex items-center gap-1.5 text-[#F19A0E]/80">
        🌍 <span className="hidden sm:inline">{t('announcement.delivery')}</span>
      </span>
    </div>
  );
}
