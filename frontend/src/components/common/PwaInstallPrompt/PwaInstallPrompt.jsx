import { useState, useEffect } from "react";
import { Download, Share2, PlusSquare, X, Smartphone, CheckCircle2 } from "lucide-react";
import styles from "./PwaInstallPrompt.module.css";

function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  const [isStandalone] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  });

  const [isIos] = useState(() => {
    if (typeof window === "undefined") return false;
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  });

  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(sessionStorage.getItem("transitops_pwa_dismissed"));
  });

  useEffect(() => {
    if (isStandalone) return;

    // Capture Chrome/Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setDeferredPrompt(null);
      setTimeout(() => setDismissed(true), 3500);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalledSuccess(true);
        setTimeout(() => setDismissed(true), 3000);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("transitops_pwa_dismissed", "true");
  };

  if (isStandalone || dismissed) {
    return null;
  }

  // Show only if installable prompt is ready OR on mobile iOS
  if (!deferredPrompt && !isIos) {
    return null;
  }

  return (
    <>
      <div className={styles.installBanner} role="region" aria-label="Install App">
        <div className={styles.iconContainer}>
          <Smartphone size={22} className={styles.phoneIcon} />
        </div>

        <div className={styles.bannerContent}>
          <strong>Download TransitOps App</strong>
          <span>Add to your phone home screen for fast full-screen operations</span>
        </div>

        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.installBtn}
            onClick={handleInstallClick}
          >
            <Download size={14} />
            Install
          </button>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleDismiss}
            aria-label="Dismiss banner"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* iOS Safari Install Instructions Modal */}
      {showIosGuide && (
        <div className={styles.modalOverlay} onClick={() => setShowIosGuide(false)}>
          <div className={styles.iosModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <Smartphone size={20} />
                <h3>Install on iPhone / iPad</h3>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowIosGuide(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.stepsList}>
              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepText}>
                  Tap the <strong>Share</strong> button <Share2 size={16} className={styles.stepIcon} /> at the bottom of Safari.
                </div>
              </div>

              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepText}>
                  Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare size={16} className={styles.stepIcon} />.
                </div>
              </div>

              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepText}>
                  Tap <strong>Add</strong> in the top right. TransitOps will install directly on your home screen!
                </div>
              </div>
            </div>

            <button
              type="button"
              className={styles.gotItBtn}
              onClick={() => setShowIosGuide(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {installedSuccess && (
        <div className={styles.successToast}>
          <CheckCircle2 size={18} />
          <span>TransitOps installed successfully! Launch it from your home screen.</span>
        </div>
      )}
    </>
  );
}

export default PwaInstallPrompt;
