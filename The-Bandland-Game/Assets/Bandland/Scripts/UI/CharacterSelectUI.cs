using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace Bandland
{
    public class CharacterSelectUI : MonoBehaviour
    {
        [SerializeField] Button bennyButton;
        [SerializeField] Button lizzyButton;
        [SerializeField] Button continueButton;
        [SerializeField] Image bennyPreview;
        [SerializeField] Image lizzyPreview;

        CharacterId _selected = CharacterId.Benny;

        void Start()
        {
            if (GameState.Instance == null)
                new GameObject("GameState").AddComponent<GameState>();

            var benny = Resources.Load<Sprite>("Sprites/benny");
            var lizzy = Resources.Load<Sprite>("Sprites/lizzy");
            if (bennyPreview != null && benny != null) bennyPreview.sprite = benny;
            if (lizzyPreview != null && lizzy != null) lizzyPreview.sprite = lizzy;

            bennyButton?.onClick.AddListener(() => Select(CharacterId.Benny));
            lizzyButton?.onClick.AddListener(() => Select(CharacterId.Lizzy));
            continueButton?.onClick.AddListener(OnContinue);
            Select(CharacterId.Benny);
        }

        void Select(CharacterId id)
        {
            _selected = id;
            GameState.Instance.SelectedCharacter = id;
        }

        void OnContinue()
        {
            GameState.Instance.HasTrashLid = true;
            SceneNavigator.LoadHub();
        }
    }
}
