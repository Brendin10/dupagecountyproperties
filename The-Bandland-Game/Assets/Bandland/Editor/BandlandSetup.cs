#if UNITY_EDITOR
using System.IO;
using Bandland.Gig;
using TMPro;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;

namespace Bandland.Editor
{
    public static class BandlandSetup
    {
        const string Root = "Assets/Bandland";
        const string Scenes = Root + "/Scenes";

        [MenuItem("Bandland/Setup Project (Run Once)")]
        public static void SetupAll()
        {
            EnsureConfig();
            EnsureFolders();
            CreateCharacterSelectScene();
            CreateHubScene();
            CreateGigScene();
            SetBuildSettings();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("Bandland setup complete! Open Scenes/CharacterSelect.unity and press Play.");
        }

        static void EnsureFolders()
        {
            if (!AssetDatabase.IsValidFolder(Scenes))
                Directory.CreateDirectory(Scenes);
        }

        static void EnsureConfig()
        {
            string res = Root + "/Resources";
            if (!AssetDatabase.IsValidFolder(res))
                Directory.CreateDirectory(res);
            string path = res + "/BandlandConfig.asset";
            if (AssetDatabase.LoadAssetAtPath<BandlandConfig>(path) == null)
            {
                var cfg = ScriptableObject.CreateInstance<BandlandConfig>();
                AssetDatabase.CreateAsset(cfg, path);
            }

            foreach (var tex in Directory.GetFiles(Root + "/Art/Sprites", "*.png"))
            {
                string dest = Root + "/Resources/Sprites/" + Path.GetFileName(tex);
                if (!File.Exists(dest))
                    File.Copy(tex, dest, true);
            }
            foreach (var wav in Directory.GetFiles(Root + "/Audio", "*.wav"))
            {
                string dest = Root + "/Resources/Audio/" + Path.GetFileName(wav);
                if (!File.Exists(dest))
                    File.Copy(wav, dest, true);
            }
            AssetDatabase.Refresh();
            SetSpritesToMultiple(Root + "/Resources/Sprites");
        }

        static void SetSpritesToMultiple(string folder)
        {
            foreach (var guid in AssetDatabase.FindAssets("t:Texture2D", new[] { folder }))
            {
                string p = AssetDatabase.GUIDToAssetPath(guid);
                var imp = AssetImporter.GetAtPath(p) as TextureImporter;
                if (imp == null) continue;
                imp.textureType = TextureImporterType.Sprite;
                imp.spritePixelsPerUnit = 100;
                imp.filterMode = FilterMode.Bilinear;
                imp.SaveAndReimport();
            }
        }

        static void CreateCharacterSelectScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            var cam = Camera.main;
            if (cam != null) { cam.backgroundColor = new Color(0.1f, 0.06f, 0.2f); cam.orthographic = true; }

            var canvas = CreateCanvas("UI");
            var title = CreateTMP(canvas.transform, "Title", "PICK YOUR STAR", 48, new Vector2(0, 200));
            title.alignment = TextAlignmentOptions.Center;

            var bennyBtn = CreateButton(canvas.transform, "BennyBtn", "BENNY", new Vector2(-200, 0));
            var lizzyBtn = CreateButton(canvas.transform, "LizzyBtn", "LIZZY", new Vector2(200, 0));
            var contBtn = CreateButton(canvas.transform, "ContinueBtn", "CONTINUE", new Vector2(0, -220));

            var bennyImg = CreateImage(canvas.transform, "BennyPreview", new Vector2(-200, 80), new Vector2(180, 240));
            var lizzyImg = CreateImage(canvas.transform, "LizzyPreview", new Vector2(200, 80), new Vector2(180, 240));

            var ui = new GameObject("CharacterSelectUI").AddComponent<CharacterSelectUI>();
            var so = new SerializedObject(ui);
            so.FindProperty("bennyButton").objectReferenceValue = bennyBtn;
            so.FindProperty("lizzyButton").objectReferenceValue = lizzyBtn;
            so.FindProperty("continueButton").objectReferenceValue = contBtn;
            so.FindProperty("bennyPreview").objectReferenceValue = bennyImg;
            so.FindProperty("lizzyPreview").objectReferenceValue = lizzyImg;
            so.ApplyModifiedProperties();

            new GameObject("GameState").AddComponent<GameState>();
            EditorSceneManager.SaveScene(scene, Scenes + "/CharacterSelect.unity");
        }

        static void CreateHubScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            Camera.main.backgroundColor = new Color(0.08f, 0.05f, 0.18f);
            Camera.main.orthographic = true;

            var canvas = CreateCanvas("UI");
            var cash = CreateTMP(canvas.transform, "Cash", "BandCash: $0", 28, new Vector2(-300, 220));
            var star = CreateTMP(canvas.transform, "Stars", "Star Meter: 0", 28, new Vector2(300, 220));
            var venue = CreateTMP(canvas.transform, "Venue", "Street Corner", 36, new Vector2(0, 120));
            venue.alignment = TextAlignmentOptions.Center;
            var preview = CreateImage(canvas.transform, "CharPreview", new Vector2(0, -20), new Vector2(160, 220));
            var play = CreateButton(canvas.transform, "PlayBtn", "PLAY GIG", new Vector2(0, -180));
            var prev = CreateButton(canvas.transform, "PrevBtn", "◀", new Vector2(-120, 80));
            var next = CreateButton(canvas.transform, "NextBtn", "▶", new Vector2(120, 80));
            prev.GetComponent<RectTransform>().sizeDelta = new Vector2(60, 50);
            next.GetComponent<RectTransform>().sizeDelta = new Vector2(60, 50);

            var ui = new GameObject("HubUI").AddComponent<HubUI>();
            var so = new SerializedObject(ui);
            so.FindProperty("cashLabel").objectReferenceValue = cash;
            so.FindProperty("starLabel").objectReferenceValue = star;
            so.FindProperty("venueLabel").objectReferenceValue = venue;
            so.FindProperty("playGigButton").objectReferenceValue = play;
            so.FindProperty("prevVenueButton").objectReferenceValue = prev;
            so.FindProperty("nextVenueButton").objectReferenceValue = next;
            so.FindProperty("characterPreview").objectReferenceValue = preview;
            so.ApplyModifiedProperties();

            EditorSceneManager.SaveScene(scene, Scenes + "/Hub.unity");
        }

        static void CreateGigScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            var cam = Camera.main;
            cam.backgroundColor = new Color(0.05f, 0.02f, 0.12f);
            cam.orthographic = true;
            cam.orthographicSize = 5.5f;
            cam.transform.position = new Vector3(0, 1, -10);

            // Background
            var bg = new GameObject("StageBG");
            var bgSr = bg.AddComponent<SpriteRenderer>();
            bgSr.sprite = LoadSprite("stage_nightlife_bg");
            bgSr.sortingOrder = -10;
            bg.transform.localScale = Vector3.one * 0.012f;

            // Neon strips
            var neon1 = CreateNeonStrip("NeonPink", new Vector3(-3f, 2.5f, 0), new Color(1f, 0.2f, 0.5f));
            var neon2 = CreateNeonStrip("NeonCyan", new Vector3(3f, 2.5f, 0), new Color(0.2f, 0.85f, 1f));

            // Spotlights
            var spot1 = CreateSpotlight("SpotLeft", new Vector3(-2f, 4f, -2f));
            var spot2 = CreateSpotlight("SpotRight", new Vector3(2f, 4f, -2f));

            // Crowd (in front of performer from camera view = higher Y, backs to camera)
            var crowdGo = new GameObject("CrowdController");
            var crowdRoot = new GameObject("CrowdRoot").transform;
            crowdRoot.SetParent(crowdGo.transform);
            crowdRoot.localPosition = new Vector3(0, 2.2f, 0);
            var crowd = crowdGo.AddComponent<CrowdController>();
            var crowdSo = new SerializedObject(crowd);
            crowdSo.FindProperty("crowdRoot").objectReferenceValue = crowdRoot;
            crowdSo.ApplyModifiedProperties();

            // Performer on stage
            var performer = new GameObject("Performer");
            performer.transform.position = new Vector3(0, -0.5f, 0);
            var pSr = performer.AddComponent<SpriteRenderer>();
            pSr.sortingOrder = 20;

            // Rhythm
            var rhythmGo = new GameObject("RhythmConductor");
            var rhythm = rhythmGo.AddComponent<RhythmConductor>();
            var audioGo = new GameObject("Audio");
            var sfx = audioGo.AddComponent<AudioSource>();
            var tickSrc = audioGo.AddComponent<AudioSource>();
            tickSrc.clip = LoadAudio("beat_tick");
            tickSrc.playOnAwake = false;
            var rhythmSo = new SerializedObject(rhythm);
            rhythmSo.FindProperty("beatTickSource").objectReferenceValue = tickSrc;
            rhythmSo.ApplyModifiedProperties();

            // Nightlife
            var ambience = new GameObject("NightlifeAmbience").AddComponent<NightlifeAmbience>();
            var ambSo = new SerializedObject(ambience);
            ambSo.FindProperty("neonStrips").arraySize = 2;
            ambSo.FindProperty("neonStrips").GetArrayElementAtIndex(0).objectReferenceValue = neon1;
            ambSo.FindProperty("neonStrips").GetArrayElementAtIndex(1).objectReferenceValue = neon2;
            ambSo.FindProperty("spotlights").arraySize = 2;
            ambSo.FindProperty("spotlights").GetArrayElementAtIndex(0).objectReferenceValue = spot1;
            ambSo.FindProperty("spotlights").GetArrayElementAtIndex(1).objectReferenceValue = spot2;
            ambSo.FindProperty("rhythm").objectReferenceValue = rhythm;
            ambSo.ApplyModifiedProperties();

            // Cutscene canvas
            var cutCanvas = CreateWorldCanvas("CutsceneCanvas", 100);
            var fade = CreateFullscreenImage(cutCanvas.transform, "Fade", Color.black);
            var fadeCg = fade.AddComponent<CanvasGroup>();
            fadeCg.alpha = 0f;
            var venueTitle = CreateTMP(cutCanvas.transform, "VenueTitle", "STREET CORNER", 56, Vector2.zero);
            venueTitle.color = new Color(1f, 0.85f, 0.3f);
            venueTitle.alignment = TextAlignmentOptions.Center;
            var subtitle = CreateTMP(cutCanvas.transform, "Subtitle", "TONIGHT", 24, new Vector2(0, -50));
            subtitle.alignment = TextAlignmentOptions.Center;

            var cutscene = new GameObject("GigCutscene").AddComponent<GigCutscene>();
            var cutSo = new SerializedObject(cutscene);
            cutSo.FindProperty("fadeOverlay").objectReferenceValue = fadeCg;
            cutSo.FindProperty("venueTitle").objectReferenceValue = venueTitle;
            cutSo.FindProperty("subtitleText").objectReferenceValue = subtitle;
            cutSo.FindProperty("performer").objectReferenceValue = performer.transform;
            cutSo.FindProperty("performerStartPos").vector3Value = new Vector3(-4f, -0.5f, 0);
            cutSo.FindProperty("performerStagePos").vector3Value = new Vector3(0, -0.5f, 0);
            cutSo.ApplyModifiedProperties();

            // Gameplay UI
            var gameCanvas = CreateCanvas("GameplayCanvas");
            var gameplayPanel = gameCanvas;
            var cashT = CreateTMP(gameCanvas.transform, "Cash", "$0", 24, new Vector2(-350, 240));
            var starT = CreateTMP(gameCanvas.transform, "Stars", "⭐ 0", 24, new Vector2(350, 240));
            var comboT = CreateTMP(gameCanvas.transform, "Combo", "", 32, new Vector2(0, 200));
            comboT.alignment = TextAlignmentOptions.Center;
            var ratingT = CreateTMP(gameCanvas.transform, "Rating", "", 28, new Vector2(0, 160));
            ratingT.alignment = TextAlignmentOptions.Center;
            var timerT = CreateTMP(gameCanvas.transform, "Timer", "45", 36, new Vector2(350, 180));
            var crowdSl = CreateSlider(gameCanvas.transform, "CrowdSlider", new Vector2(-200, -300), "CROWD");
            var cheerSl = CreateSlider(gameCanvas.transform, "CheerSlider", new Vector2(200, -300), "CHEER");

            // Beat lane
            var lanePanel = CreateBeatLane(gameCanvas.transform);
            var beatLane = lanePanel.GetComponent<BeatLaneController>();
            var notePrefab = lanePanel.transform.Find("NotePrefab").GetComponent<Image>();

            var playBtn = CreateButton(gameCanvas.transform, "PlayBtn", "TAP ON BEAT!", new Vector2(0, -120));
            playBtn.GetComponent<RectTransform>().sizeDelta = new Vector2(220, 58);

            // Crowd ambience loop
            var crowdMurmurSrc = audioGo.AddComponent<AudioSource>();
            crowdMurmurSrc.clip = LoadAudio("crowd_murmur");
            crowdMurmurSrc.loop = true;
            crowdMurmurSrc.volume = 0.08f;
            crowdMurmurSrc.playOnAwake = false;
            var crowdAudio = audioGo.AddComponent<CrowdAudioController>();
            var crowdAudioSo = new SerializedObject(crowdAudio);
            crowdAudioSo.FindProperty("crowdSource").objectReferenceValue = crowdMurmurSrc;
            crowdAudioSo.ApplyModifiedProperties();

            // Gig controller
            var gig = new GameObject("GigController").AddComponent<GigController>();
            var gigSo = new SerializedObject(gig);
            gigSo.FindProperty("cutscene").objectReferenceValue = cutscene;
            gigSo.FindProperty("rhythm").objectReferenceValue = rhythm;
            gigSo.FindProperty("beatLane").objectReferenceValue = beatLane;
            gigSo.FindProperty("crowd").objectReferenceValue = crowd;
            gigSo.FindProperty("crowdAudio").objectReferenceValue = crowdAudio;
            gigSo.FindProperty("ambience").objectReferenceValue = ambience;
            gigSo.FindProperty("performer").objectReferenceValue = performer.transform;
            gigSo.FindProperty("performerRenderer").objectReferenceValue = pSr;
            gigSo.FindProperty("playButton").objectReferenceValue = playBtn;
            gigSo.FindProperty("sfxSource").objectReferenceValue = sfx;
            gigSo.FindProperty("cymbalClip").objectReferenceValue = LoadAudio("cymbal_crash");
            gigSo.FindProperty("cheerClip").objectReferenceValue = LoadAudio("crowd_cheer");
            gigSo.FindProperty("cashText").objectReferenceValue = cashT;
            gigSo.FindProperty("starText").objectReferenceValue = starT;
            gigSo.FindProperty("comboText").objectReferenceValue = comboT;
            gigSo.FindProperty("ratingText").objectReferenceValue = ratingT;
            gigSo.FindProperty("timerText").objectReferenceValue = timerT;
            gigSo.FindProperty("crowdSlider").objectReferenceValue = crowdSl;
            gigSo.FindProperty("cheerSlider").objectReferenceValue = cheerSl;
            gigSo.FindProperty("gameplayPanel").objectReferenceValue = gameplayPanel;
            gigSo.ApplyModifiedProperties();

            // Wire beat lane internals
            var laneSo = new SerializedObject(beatLane);
            laneSo.FindProperty("rhythm").objectReferenceValue = rhythm;
            laneSo.FindProperty("notePrefab").objectReferenceValue = notePrefab;
            laneSo.ApplyModifiedProperties();
            notePrefab.gameObject.SetActive(false);

            EditorSceneManager.SaveScene(scene, Scenes + "/Gig.unity");
        }

        static void SetBuildSettings()
        {
            EditorBuildSettings.scenes = new[]
            {
                new EditorBuildSettingsScene(Scenes + "/CharacterSelect.unity", true),
                new EditorBuildSettingsScene(Scenes + "/Hub.unity", true),
                new EditorBuildSettingsScene(Scenes + "/Gig.unity", true),
            };
        }

        static GameObject CreateBeatLane(Transform parent)
        {
            var root = new GameObject("BeatLane");
            root.transform.SetParent(parent, false);
            var rootRt = root.AddComponent<RectTransform>();
            rootRt.anchorMin = new Vector2(0.05f, 0.02f);
            rootRt.anchorMax = new Vector2(0.95f, 0.18f);
            rootRt.offsetMin = rootRt.offsetMax = Vector2.zero;

            var laneBg = new GameObject("LaneBG");
            laneBg.transform.SetParent(root.transform, false);
            var bgRt = laneBg.AddComponent<RectTransform>();
            bgRt.anchorMin = Vector2.zero;
            bgRt.anchorMax = Vector2.one;
            bgRt.offsetMin = bgRt.offsetMax = Vector2.zero;
            var bgImg = laneBg.AddComponent<Image>();
            bgImg.color = new Color(0.08f, 0.05f, 0.16f, 0.92f);

            var notesGo = new GameObject("Notes");
            notesGo.transform.SetParent(root.transform, false);
            var notesRt = notesGo.AddComponent<RectTransform>();
            notesRt.anchorMin = Vector2.zero;
            notesRt.anchorMax = Vector2.one;
            notesRt.offsetMin = notesRt.offsetMax = Vector2.zero;

            var hitGo = new GameObject("HitLine");
            hitGo.transform.SetParent(root.transform, false);
            var hitRt = hitGo.AddComponent<RectTransform>();
            hitRt.sizeDelta = new Vector2(8f, 120f);
            hitRt.anchoredPosition = Vector2.zero;
            var hitImg = hitGo.AddComponent<Image>();
            hitImg.color = new Color(1f, 0.85f, 0.3f, 0.85f);

            var noteGo = new GameObject("NotePrefab");
            noteGo.transform.SetParent(root.transform, false);
            var noteRt = noteGo.AddComponent<RectTransform>();
            noteRt.sizeDelta = new Vector2(48f, 48f);
            var noteImg = noteGo.AddComponent<Image>();
            noteImg.color = new Color(1f, 0.45f, 0.65f, 1f);

            var lane = root.AddComponent<BeatLaneController>();
            var so = new SerializedObject(lane);
            so.FindProperty("laneRect").objectReferenceValue = rootRt;
            so.FindProperty("notesParent").objectReferenceValue = notesRt;
            so.FindProperty("hitLine").objectReferenceValue = hitRt;
            so.FindProperty("notePrefab").objectReferenceValue = noteImg;
            so.ApplyModifiedProperties();

            CreateTMP(root.transform, "LaneLabel", "BEAT LANE — tap when notes hit the line", 16, new Vector2(0, 52)).alignment = TextAlignmentOptions.Center;
            return root;
        }

        static GameObject CreateCanvas(string name)
        {
            var go = new GameObject(name);
            var c = go.AddComponent<Canvas>();
            c.renderMode = RenderMode.ScreenSpaceOverlay;
            go.AddComponent<CanvasScaler>().uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            go.GetComponent<CanvasScaler>().referenceResolution = new Vector2(1920, 1080);
            go.AddComponent<GraphicRaycaster>();
            return go;
        }

        static GameObject CreateWorldCanvas(string name, int order)
        {
            var go = CreateCanvas(name);
            go.GetComponent<Canvas>().renderMode = RenderMode.ScreenSpaceOverlay;
            go.GetComponent<Canvas>().sortingOrder = order;
            return go;
        }

        static TextMeshProUGUI CreateTMP(Transform parent, string name, string text, int size, Vector2 pos)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            var rt = go.AddComponent<RectTransform>();
            rt.anchoredPosition = pos;
            rt.sizeDelta = new Vector2(600, 80);
            var tmp = go.AddComponent<TextMeshProUGUI>();
            tmp.text = text;
            tmp.fontSize = size;
            tmp.color = Color.white;
            return tmp;
        }

        static Button CreateButton(Transform parent, string name, string label, Vector2 pos)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            var rt = go.AddComponent<RectTransform>();
            rt.anchoredPosition = pos;
            rt.sizeDelta = new Vector2(200, 55);
            var img = go.AddComponent<Image>();
            img.color = new Color(0.9f, 0.35f, 0.55f);
            var btn = go.AddComponent<Button>();
            var textGo = new GameObject("Text");
            textGo.transform.SetParent(go.transform, false);
            var trt = textGo.AddComponent<RectTransform>();
            trt.anchorMin = Vector2.zero;
            trt.anchorMax = Vector2.one;
            trt.offsetMin = trt.offsetMax = Vector2.zero;
            var tmp = textGo.AddComponent<TextMeshProUGUI>();
            tmp.text = label;
            tmp.fontSize = 22;
            tmp.alignment = TextAlignmentOptions.Center;
            tmp.color = Color.white;
            return btn;
        }

        static Image CreateImage(Transform parent, string name, Vector2 pos, Vector2 size)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            var rt = go.AddComponent<RectTransform>();
            rt.anchoredPosition = pos;
            rt.sizeDelta = size;
            return go.AddComponent<Image>();
        }

        static GameObject CreateFullscreenImage(Transform parent, string name, Color color)
        {
            var img = CreateImage(parent, name, Vector2.zero, Vector2.zero);
            var rt = img.rectTransform;
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.offsetMin = rt.offsetMax = Vector2.zero;
            img.color = color;
            return img.gameObject;
        }

        static Slider CreateSlider(Transform parent, string name, Vector2 pos, string label)
        {
            CreateTMP(parent, name + "Label", label, 16, pos + new Vector2(0, 25));
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            var rt = go.AddComponent<RectTransform>();
            rt.anchoredPosition = pos;
            rt.sizeDelta = new Vector2(200, 20);
            var slider = go.AddComponent<Slider>();
            var bg = new GameObject("BG").AddComponent<Image>();
            bg.transform.SetParent(go.transform, false);
            bg.color = new Color(0.2f, 0.2f, 0.3f);
            var fill = new GameObject("Fill").AddComponent<Image>();
            fill.transform.SetParent(go.transform, false);
            fill.color = new Color(0.4f, 0.9f, 0.6f);
            slider.fillRect = fill.rectTransform;
            return slider;
        }

        static SpriteRenderer CreateNeonStrip(string name, Vector3 pos, Color color)
        {
            var go = new GameObject(name);
            go.transform.position = pos;
            go.transform.localScale = new Vector3(3f, 0.15f, 1f);
            var sr = go.AddComponent<SpriteRenderer>();
            sr.sprite = GetWhiteSprite();
            sr.color = color;
            sr.sortingOrder = -5;
            return sr;
        }

        static Light CreateSpotlight(string name, Vector3 pos)
        {
            var go = new GameObject(name);
            go.transform.position = pos;
            var l = go.AddComponent<Light>();
            l.type = LightType.Spot;
            l.color = new Color(1f, 0.9f, 0.7f);
            l.intensity = 1.2f;
            l.spotAngle = 45f;
            return l;
        }

        static Sprite GetWhiteSprite()
        {
            var tex = new Texture2D(1, 1);
            tex.SetPixel(0, 0, Color.white);
            tex.Apply();
            return Sprite.Create(tex, new Rect(0, 0, 1, 1), new Vector2(0.5f, 0.5f), 1f);
        }

        static Sprite LoadSprite(string name)
        {
            return AssetDatabase.LoadAssetAtPath<Sprite>($"{Root}/Resources/Sprites/{name}.png");
        }

        static AudioClip LoadAudio(string name)
        {
            return AssetDatabase.LoadAssetAtPath<AudioClip>($"{Root}/Resources/Audio/{name}.wav");
        }
    }
}
#endif
