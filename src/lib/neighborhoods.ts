export interface Neighborhood {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const NEIGHBORHOODS: Neighborhood[] = [
  { id: "gangnam", name: "강남", lat: 37.4979, lng: 127.0276 },
  { id: "yeoksam", name: "역삼", lat: 37.5007, lng: 127.0365 },
  { id: "seolleung", name: "선릉", lat: 37.5045, lng: 127.049 },
  { id: "samsung", name: "삼성", lat: 37.5088, lng: 127.0631 },
  { id: "euljiro", name: "을지로", lat: 37.5662, lng: 126.9912 },
  { id: "gwanghwamun", name: "광화문", lat: 37.5758, lng: 126.9769 },
  { id: "jongro", name: "종로", lat: 37.5704, lng: 126.9831 },
  { id: "yeouido", name: "여의도", lat: 37.5219, lng: 126.9245 },
  { id: "mapo", name: "마포/홍대", lat: 37.5572, lng: 126.9236 },
  { id: "seongsu", name: "성수", lat: 37.5445, lng: 127.056 },
  { id: "pangyo", name: "판교", lat: 37.3948, lng: 127.1112 },
  { id: "guro", name: "구로디지털단지", lat: 37.4851, lng: 126.9015 },
  { id: "sindorim", name: "신도림", lat: 37.5089, lng: 126.8912 },
  { id: "jamsil", name: "잠실", lat: 37.5133, lng: 127.1001 },
  { id: "hongdae", name: "합정/망원", lat: 37.5495, lng: 126.9137 },
];

export const DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];
