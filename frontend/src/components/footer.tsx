import { useLanguage } from '../context/LanguageContext';
import { useTranslations } from '../translations';

function Footer() {
  const { language } = useLanguage();
  const t = useTranslations(language);

  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <a href="/" className="site-logo">
          Helsinguide
        </a>
        <p>{t.footerTagline}</p>
      </div>

      <div
        className="site-footer__coordinates"
        aria-label="Helsinki coordinates"
      >
        <span className="site-footer__coordinates-title">
          {t.helsinki.toUpperCase()}
        </span>
        <span className="site-footer__coordinates-value">
          60°10′N 24°56′E
        </span>
      </div>

      <p className="site-footer__copyright">
        © 2026 Helsinguide
      </p>
    </footer>
  );
}

export default Footer;