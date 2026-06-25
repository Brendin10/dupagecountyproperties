using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace Bandland.Gig
{
    public class GigCutscene : MonoBehaviour
    {
        [SerializeField] CanvasGroup fadeOverlay;
        [SerializeField] TextMeshProUGUI venueTitle;
        [SerializeField] TextMeshProUGUI subtitleText;
        [SerializeField] Transform performer;
        [SerializeField] Vector3 performerStartPos;
        [SerializeField] Vector3 performerStagePos;
        [SerializeField] float fadeDuration = 0.8f;
        [SerializeField] float titleHold = 1.6f;

        public bool IsPlaying { get; private set; }

        public IEnumerator PlayIntro(string venueName)
        {
            IsPlaying = true;
            if (fadeOverlay != null)
            {
                fadeOverlay.alpha = 1f;
                fadeOverlay.blocksRaycasts = true;
            }

            if (venueTitle != null)
            {
                venueTitle.text = venueName.ToUpper();
                venueTitle.alpha = 0f;
            }
            if (subtitleText != null)
            {
                subtitleText.text = "TONIGHT";
                subtitleText.alpha = 0f;
            }

            if (performer != null)
                performer.position = performerStartPos;

            yield return Fade(0f, 1f, fadeDuration * 0.5f);
            yield return FadeText(1f, 0.4f);
            yield return new WaitForSeconds(titleHold);
            yield return FadeText(0f, 0.4f);
            yield return Fade(1f, 0f, fadeDuration);

            if (performer != null)
            {
                float walk = 0f;
                float walkDur = 1.2f;
                while (walk < walkDur)
                {
                    walk += Time.deltaTime;
                    float t = walk / walkDur;
                    t = t * t * (3f - 2f * t);
                    performer.position = Vector3.Lerp(performerStartPos, performerStagePos, t);
                    yield return null;
                }
            }

            if (fadeOverlay != null)
                fadeOverlay.blocksRaycasts = false;
            IsPlaying = false;
        }

        IEnumerator Fade(float from, float to, float dur)
        {
            if (fadeOverlay == null) yield break;
            float t = 0f;
            while (t < dur)
            {
                t += Time.deltaTime;
                fadeOverlay.alpha = Mathf.Lerp(from, to, t / dur);
                yield return null;
            }
            fadeOverlay.alpha = to;
        }

        IEnumerator FadeText(float target, float dur)
        {
            float t = 0f;
            float v0 = venueTitle != null ? venueTitle.alpha : 0f;
            float s0 = subtitleText != null ? subtitleText.alpha : 0f;
            while (t < dur)
            {
                t += Time.deltaTime;
                float a = Mathf.Lerp(v0, target, t / dur);
                if (venueTitle != null) venueTitle.alpha = a;
                if (subtitleText != null) subtitleText.alpha = a * 0.8f;
                yield return null;
            }
        }
    }
}
