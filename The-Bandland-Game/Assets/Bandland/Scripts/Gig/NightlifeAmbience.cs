using UnityEngine;

namespace Bandland.Gig
{
    public class NightlifeAmbience : MonoBehaviour
    {
        [SerializeField] SpriteRenderer[] neonStrips;
        [SerializeField] Light[] spotlights;
        [SerializeField] Color neonPink = new(1f, 0.2f, 0.5f);
        [SerializeField] Color neonCyan = new(0.2f, 0.85f, 1f);
        [SerializeField] RhythmConductor rhythm;

        float _hueShift;

        void Update()
        {
            _hueShift += Time.deltaTime * 0.4f;
            float pulse = rhythm != null && rhythm.IsRunning ? rhythm.GetBeatPulse() : Mathf.PingPong(_hueShift, 1f);

            if (neonStrips != null)
            {
                for (int i = 0; i < neonStrips.Length; i++)
                {
                    if (neonStrips[i] == null) continue;
                    var c = i % 2 == 0 ? neonPink : neonCyan;
                    c.a = 0.5f + pulse * 0.5f;
                    neonStrips[i].color = c;
                }
            }

            if (spotlights != null)
            {
                for (int i = 0; i < spotlights.Length; i++)
                {
                    if (spotlights[i] == null) continue;
                    spotlights[i].intensity = 0.8f + pulse * 1.2f;
                    spotlights[i].transform.rotation = Quaternion.Euler(50f, Mathf.Sin(_hueShift + i) * 20f, 0f);
                }
            }
        }
    }
}
