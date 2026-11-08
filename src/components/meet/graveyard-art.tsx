/*
 * The footer graveyard's illustrations, inlined from ./art/graveyard (made from the prompts in
 * docs/footer-graveyard-svg-prompts.md). Each draws on its source file's own grid; the
 * scene in graveyard.tsx places and scales them.
 */

/** LotteryClock's headstone on a 160 × 180 grid: the plinth's base at y 169, a blank face
 *  from x 40–120 and y 45–105 for the epitaph (set in code), and dug-up earth below. */
export function MainHeadstoneArt() {
  return (
    <>
      <g>
        <path
          d="M 27 156 V 63 C 27 49 33 40 40 33 L 44 35 L 46 27 C 56 17 67 12 80 12 C 111 12 133 34 133 63 V 89 L 130 93 L 133 97 V 146 L 130 151 L 133 156 Z"
          fill="#5B4266"
        />
        <path
          d="M 27 151 V 63 C 27 49 33 40 40 33 L 44 35 L 46 27 C 56 17 67 12 80 12 Q 86 12 89 13 C 62 14 43 29 37 48 C 34 61 35 96 35 149 Z"
          fill="#8A6F96"
        />
        <path
          d="M 116 27 C 127 36 133 48 133 63 V 89 L 130 93 L 133 97 V 146 L 130 151 L 133 156 H 124 V 65 C 124 47 121 37 116 27 Z"
          fill="#3D2846"
        />
        <path
          d="M 18 153 H 142 Q 146 153 146 157 V 169 H 14 V 157 Q 14 153 18 153 Z"
          fill="#5B4266"
        />
        <path
          d="M 18 153 H 142 L 137 157 H 14 Q 14 153 18 153 Z"
          fill="#8A6F96"
        />
        <path d="M 137 157 H 146 V 169 H 137 Z" fill="#3D2846" />
        <path
          d="M 133 79 L 127 86 L 130 93 L 124 102 L 128 109 L 121 118 L 125 126 L 122 135 L 120 126 L 117 118 L 124 109 L 121 102 L 127 92 L 124 86 Z"
          fill="#2F1A35"
        />
        <path
          d="M 28 151 V 140 Q 30 134 34 138 Q 38 130 43 135 Q 47 132 49 137 L 53 152 Z M 30 153 Q 26 148 31 145 Q 32 140 37 143 Q 40 136 44 140 L 48 153 Z"
          fill="#3F5A26"
        />
        <path
          d="M 29 152 Q 27 146 32 146 Q 32 140 36 142 Q 39 136 42 140 Q 45 140 45 146 L 49 152 Z M 31 136 Q 29 132 33 130 Q 34 126 38 129 L 39 137 Z"
          fill="#5C7A2E"
        />
        <path
          d="M 80 12 Q 86 9 90 14 Q 97 12 99 18 L 95 22 Q 90 18 87 21 Q 83 22 82 18 Q 76 19 78 15 Z"
          fill="#3F5A26"
        />
        <path
          d="M 81 12 Q 87 10 90 14 Q 95 12 97 16 Q 92 15 90 18 L 84 17 Q 80 18 81 12 Z"
          fill="#5C7A2E"
        />
        <g>
          <path
            d="M 90.5 130 A 10.5 10.5 0 1 1 69.5 130 A 10.5 10.5 0 1 1 90.5 130 Z M 87.8 130 A 7.8 7.8 0 1 0 72.2 130 A 7.8 7.8 0 1 0 87.8 130 Z"
            fill="#2F1A35"
            fillRule="evenodd"
          />
          <path
            d="M 66 119 C 64 114 71 110 75 113 Q 78 115 76 117 Z M 94 119 C 96 114 89 110 85 113 Q 82 115 84 117 Z M 79 111 H 81 V 120 H 79 Z M 73 138 L 70 144 H 74 L 77 140 Z M 87 138 L 90 144 H 86 L 83 140 Z M 79 129 H 81 V 137 H 79 Z M 80 129 L 81 131 L 75 136 L 73.5 134.5 Z"
            fill="#2F1A35"
          />
        </g>
      </g>
      <g>
        <path
          d="M 3 180 C 5 174 15 171 23 169 C 34 160 46 165 53 162 C 66 155 80 161 88 164 C 102 158 113 165 122 166 C 138 164 151 173 157 180 Z"
          fill="#3A1C30"
        />
        <path
          d="M 3 180 Q 9 175 22 176 Q 35 171 48 176 Q 62 172 75 177 Q 88 173 102 177 Q 119 174 132 178 Q 148 176 157 180 Z"
          fill="#2A1424"
        />
        <path
          d="M 18 169 Q 15 164 20 162 Q 25 161 27 166 L 26 170 Z M 46 165 Q 42 160 47 158 Q 53 157 55 163 Z M 95 168 Q 93 163 98 162 Q 104 162 104 168 Z M 129 172 Q 125 168 130 166 Q 137 166 138 172 Z"
          fill="#3A1C30"
        />
      </g>
    </>
  );
}

/** The small headstones, each on a 60 × 80 grid standing on the bottom edge, centred on x 30. */
export const STONE_ART = {
  round: (
    <>
      <path
        d="M 9 74 V 33 C 9 18 18 9 30 9 C 43 9 51 19 51 33 V 45 L 48 48 L 51 51 V 74 Z"
        fill="#5B4266"
      />
      <path
        d="M 9 72 V 33 C 9 18 18 9 30 9 Q 35 9 38 11 C 23 10 15 23 15 36 V 72 Z"
        fill="#8A6F96"
      />
      <path
        d="M 43 15 Q 51 21 51 33 V 45 L 48 48 L 51 51 V 74 H 44 V 33 Q 44 21 43 15 Z"
        fill="#3D2846"
      />
      <path
        d="M 16 68 V 34 C 16 23 22 17 30 17 C 39 17 44 24 44 34 V 68 Z M 18.5 65.5 H 41.5 V 34 C 41.5 25 37 19.5 30 19.5 C 23 19.5 18.5 25 18.5 34 Z"
        fill="#2F1A35"
        fillRule="evenodd"
      />
      <path
        d="M 28 29 H 32 V 38 H 39 V 42 H 32 V 55 H 28 V 42 H 21 V 38 H 28 Z"
        fill="#2F1A35"
      />
      <path
        d="M 6 75 Q 6 72 9 72 H 51 Q 54 72 54 75 V 80 H 6 Z"
        fill="#5B4266"
      />
      <path d="M 6 75 H 47 V 77 H 6 Z" fill="#8A6F96" />
      <path d="M 47 75 H 54 V 80 H 47 Z" fill="#3D2846" />
      <path
        d="M 9 78 Q 7 72 12 71 Q 12 66 17 68 Q 21 66 23 70 L 25 78 Z"
        fill="#3F5A26"
      />
      <path
        d="M 10 77 Q 9 72 14 73 Q 15 68 18 71 Q 23 69 23 77 Z"
        fill="#5C7A2E"
      />
    </>
  ),
  cross: (
    <>
      <path
        d="M 49 33 A 19 19 0 1 1 11 33 A 19 19 0 1 1 49 33 Z M 42 33 A 12 12 0 1 0 18 33 A 12 12 0 1 0 42 33 Z"
        fill="#5B4266"
        fillRule="evenodd"
      />
      <path
        d="M 23 8 Q 23 5 26 5 H 34 Q 37 5 37 8 V 23 H 47 L 51 27 V 37 Q 51 40 48 40 H 37 V 70 H 23 V 40 H 12 Q 9 40 9 37 V 26 Q 9 23 12 23 H 23 Z"
        fill="#5B4266"
      />
      <path
        d="M 23 8 Q 23 5 26 5 H 29 V 27 H 12 Q 9 27 9 30 V 26 Q 9 23 12 23 H 23 Z M 23 40 H 27 V 70 H 23 Z M 12 30 Q 10 18 23 15 V 19 Q 15 23 15 30 Z"
        fill="#8A6F96"
      />
      <path
        d="M 33 5 H 34 Q 37 5 37 8 V 23 H 47 L 51 27 V 37 Q 51 40 48 40 H 37 V 70 H 33 V 36 H 47 V 28 H 33 Z"
        fill="#3D2846"
      />
      <path
        d="M 28 15 H 32 V 31 H 43 V 35 H 32 V 60 H 28 V 35 H 17 V 31 H 28 Z"
        fill="#2F1A35"
      />
      <path
        d="M 18 68 H 42 Q 45 68 45 71 V 80 H 15 V 71 Q 15 68 18 68 Z"
        fill="#5B4266"
      />
      <path d="M 18 68 H 42 L 39 71 H 15 Q 15 68 18 68 Z" fill="#8A6F96" />
      <path d="M 39 71 H 45 V 80 H 39 Z" fill="#3D2846" />
      <path
        d="M 16 79 Q 14 74 19 73 Q 19 68 23 71 Q 26 68 28 73 L 29 79 Z"
        fill="#3F5A26"
      />
      <path d="M 17 79 Q 17 74 21 75 Q 22 71 25 74 L 26 79 Z" fill="#5C7A2E" />
    </>
  ),
  ornate: (
    <>
      <path
        d="M 14 70 V 37 H 10 V 31 H 15 V 26 C 15 17 24 16 30 6 C 36 16 45 17 45 26 V 31 H 50 V 37 H 46 V 70 Z"
        fill="#5B4266"
      />
      <path
        d="M 14 68 V 37 H 10 V 31 H 15 V 26 C 15 17 24 16 30 6 L 32 10 C 22 21 21 23 21 30 V 35 H 17 V 68 Z"
        fill="#8A6F96"
      />
      <path
        d="M 39 20 Q 45 23 45 26 V 31 H 50 V 37 H 46 V 70 H 40 V 34 H 43 V 30 H 39 Z"
        fill="#3D2846"
      />
      <path
        d="M 30 20 C 34 17 37 22 35 25 C 41 25 41 31 35 32 C 38 37 33 40 30 35 C 27 40 22 37 25 32 C 19 31 19 25 25 25 C 23 22 26 17 30 20 Z"
        fill="#2F1A35"
      />
      <circle cx="30" cy="28" r="2" fill="#5B4266" />
      <path
        d="M 22 46 H 38 V 49 H 22 Z M 24 55 H 36 V 58 H 24 Z"
        fill="#2F1A35"
      />
      <path d="M 10 68 H 50 V 74 H 55 V 80 H 5 V 74 H 10 Z" fill="#5B4266" />
      <path
        d="M 10 68 H 50 L 46 71 H 10 Z M 5 74 H 55 L 50 76 H 5 Z"
        fill="#8A6F96"
      />
      <path d="M 46 71 H 50 V 74 H 55 V 80 H 49 V 77 H 46 Z" fill="#3D2846" />
      <path
        d="M 8 79 Q 7 74 11 73 Q 12 68 16 70 Q 21 68 22 73 L 24 79 Z"
        fill="#3F5A26"
      />
      <path
        d="M 9 79 Q 9 75 13 75 Q 15 71 18 73 Q 22 74 21 79 Z"
        fill="#5C7A2E"
      />
    </>
  ),
  slab: (
    <>
      <path
        d="M 8 76 V 34 L 15 37 L 22 31 L 28 35 L 40 30 V 76 Z"
        fill="#5B4266"
      />
      <path d="M 8 76 V 34 L 13 36 V 74 Z" fill="#8A6F96" />
      <path d="M 34 33 L 40 30 V 76 H 34 Z" fill="#3D2846" />
      <path
        d="M 40 45 L 55 49 Q 59 50 57 54 L 50 75 L 44 72 L 39 75 L 35 70 L 30 70 Z"
        fill="#5B4266"
      />
      <path
        d="M 40 45 L 55 49 Q 59 50 57 54 L 54 53 L 42 49 L 34 70 H 30 Z"
        fill="#8A6F96"
      />
      <path d="M 54 53 L 57 54 L 50 75 L 45 73 Z" fill="#3D2846" />
      <path
        d="M 16 44 H 19 V 65 H 16 Z M 23 44 H 29 V 47 H 23 Z"
        fill="#2F1A35"
      />
      <path
        d="M 5 80 V 77 Q 5 74 8 74 H 43 L 48 76 H 53 Q 56 76 56 80 Z"
        fill="#5B4266"
      />
      <path
        d="M 4 80 L 5 75 L 10 73 L 14 77 L 13 80 Z M 48 80 L 50 74 L 55 73 L 59 78 L 58 80 Z"
        fill="#3D2846"
      />
      <path
        d="M 8 79 Q 7 73 12 72 Q 14 67 18 71 Q 22 70 23 75 L 25 79 Z"
        fill="#3F5A26"
      />
      <path d="M 9 79 Q 10 75 14 75 Q 16 71 19 74 L 21 79 Z" fill="#5C7A2E" />
    </>
  ),
};

export type StoneShape = keyof typeof STONE_ART;

/** The bare tree with its owl, on a 240 × 220 grid: the trunk's base centred on x 120 at the
 *  bottom edge. The owl's eyes blink. */
export function TreeArt() {
  return (
    <>
      <g>
        <path
          d="M 71 220 C 95 208 101 197 105 182 C 109 163 105 153 113 134 C 122 114 128 106 126 94 C 125 80 125 71 135 60 C 146 48 153 48 162 36 C 168 27 163 18 156 12 C 168 16 173 29 168 41 C 165 52 152 65 149 74 C 142 88 143 98 141 109 C 139 129 127 140 126 155 C 125 174 138 194 145 205 L 169 220 H 140 L 126 214 L 113 220 Z"
          fill="#1D0D24"
        />
        <path
          d="M 117 142 C 99 134 90 119 77 114 C 59 108 49 115 34 103 C 22 94 18 80 9 79 C 20 76 25 86 32 91 C 39 97 44 99 52 98 C 42 91 39 83 40 73 C 41 59 30 55 25 58 C 29 49 42 54 46 63 C 50 73 45 80 51 87 C 62 96 76 96 87 106 C 93 93 91 83 83 75 C 76 68 74 55 78 47 C 77 61 84 65 91 70 C 105 81 104 99 100 111 C 113 121 121 122 129 125 Z"
          fill="#1D0D24"
        />
        <path
          d="M 126 105 C 111 88 99 65 100 40 C 101 27 91 20 81 19 C 94 16 103 23 106 35 C 109 48 103 56 111 70 C 118 83 124 85 132 94 Z M 108 77 C 92 58 72 52 66 42 C 60 33 51 29 43 29 C 55 26 65 34 69 43 C 77 51 84 48 88 43 C 93 47 96 51 100 57 Z"
          fill="#1D0D24"
        />
        <path
          d="M 134 116 C 155 103 169 97 183 93 C 198 89 204 67 203 58 C 202 48 208 45 212 49 C 207 52 209 60 208 66 C 206 79 197 86 192 93 C 207 94 217 91 223 85 C 224 94 215 99 209 101 C 196 106 187 101 181 105 C 166 114 153 128 140 137 Z"
          fill="#1D0D24"
        />
        <path
          d="M 146 79 C 168 62 174 39 179 30 C 184 22 180 17 176 15 C 190 20 190 28 185 36 C 181 44 184 49 191 48 C 201 45 201 28 203 29 C 209 43 204 51 193 54 C 182 57 181 61 168 67 L 151 91 Z"
          fill="#1D0D24"
        />
        <path
          d="M 132 151 C 155 141 168 144 182 143 C 194 142 208 146 224 135 C 225 142 216 148 204 151 C 180 157 156 154 139 164 Z"
          fill="#1D0D24"
        />
        <path
          d="M 95 211 L 78 220 H 71 L 89 212 Z M 137 208 L 160 216 L 169 220 H 150 Z"
          fill="#1D0D24"
        />
      </g>
      <g>
        <path
          d="M 108 205 C 114 188 111 172 117 155 C 121 145 125 138 126 132 C 124 148 122 154 121 166 C 120 183 126 195 128 205 L 121 200 L 116 209 Z M 118 133 C 108 126 102 119 97 113 L 101 116 C 108 123 115 123 122 125 Z M 127 102 C 122 88 126 77 135 65 C 139 60 143 58 146 56 C 136 68 131 76 131 87 L 131 99 Z M 152 148 C 168 146 179 148 192 147 Q 174 151 156 151 Z"
          fill="#2C1533"
        />
      </g>
      <g>
        <ellipse cx="125" cy="165" rx="5" ry="9" fill="#2F1A35" />
      </g>
      <g>
        <path
          d="M 178 138 C 174 129 176 121 179 117 L 178 109 L 187 114 Q 191 112 196 114 L 204 109 L 203 118 C 208 126 204 137 198 141 H 185 Z M 183 139 H 187 V 145 H 183 Z M 195 139 H 199 V 145 H 195 Z"
          fill="#1D0D24"
        />
      </g>
      <g
        className="motion-safe:animate-[lc-eye-blink_4.5s_ease-in-out_infinite]"
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
      >
        <circle cx="185" cy="125" r="4" fill="#FFD45C" />
        <circle cx="197" cy="125" r="4" fill="#FFD45C" />
        <circle cx="186" cy="125" r="1.6" fill="#1D0D24" />
        <circle cx="198" cy="125" r="1.6" fill="#1D0D24" />
      </g>
    </>
  );
}
