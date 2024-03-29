# Waffle Scroll

---

- Author: `@designDefined`
- version: 1.1.2
- Last Update: 23-05-18

## Table of Content

- [Description](#Description)
- [Usage](#Usage)
- [API](#API)
- [History](#History)

## Description

스크롤에 따른 상태 변화를 쉽고 선언적으로 구현하기 위한 라이브러리입니다.

IntersectionObserver와 비슷하게 작동하지만, 이를 이용하지는 않았습니다.


---


## Usage

1. 원하는 스크롤 훅 생성하기

```typescript
const useScroll = createLocalScrollHook({
  localState: { available: false },
  defaultCallback: ({ getState, setState, progress }) => {
    if (progress > 0.8) {
      setState({ available: true });
    } else {
      setState({ available: false })
    }
  },
});
```

2. 컴포넌트에서 훅 사용하기

```typescript jsx
import { useScroll } from "./scrollHook";

const TargetComponent = () => {
  const { targetRef, state } = useScroll();

  return (
    <div ref={targetRef}
         className={`component ${state.available && "available"}`}>
      ...
    </div>
  )
}
```

3. (optional) window가 아니라 특정 엘리먼트를 스크롤 컨테이너로 사용하기

```typescript jsx
import { useScroll } from "./scrollHook";

const ContainerComponent = () => {
  return (
    <div ref={useScroll.setScrollContainer}>
      ...
    </div>
  )
}

```

### 사용 방법

1. `createGlobalScrollHook` 또는 `createLocalScrollHook`으로 원하는 스크롤 훅을 생성하세요. 생성 시에는 스크롤에 따라 변경될 상태의 초기값과 콜백 등을 넣을 수 있습니다.
2. 원하는 컴포넌트에서 생성한 훅을 이용해 스크롤 애니메이션을 적용하세요.
    1. 훅에는 콜백 함수를 전달할 수 있습니다. progress에 따라 상태를 변경하는 로직을 콜백으로 전달하세요.
    2. 훅은 targetRef와 state를 반환합니다.
3. window가 아니라 다른 대상을 스크롤 콘테이너(스크롤 이벤트가 일어나는 엘리먼트)로 사용하고 싶다면 `useScroll.setScrollContainer`를 이용하세요.


---


## API

### `createGlobalScrollHook`

스크롤 훅을 만드는 함수. 여기서 반환된 훅은 하나의 스토어를 이용하기에 상태가 공유됩니다.

**매개변수**

- `initialState`: 상태의 디폴트값을 정의하는 객체
    - globalState: 상태의 초기값
    - defaultCallback: (optional) 모든 훅 사용 시에 기본으로 적용할 콜백
    - isHorizontal: (optional) true로 하면 가로 스크롤을 감지
- `hasScrollContainer`: (optional) `window`가 아니라 다른 엘리먼트를 스크롤 컨테이너로 사용할 때 `true`로 전달

**반환값**
다음과 같은 메소드를 지닌 hook을 반환합니다
- `hook()`
  - 컴포넌트에서 사용할 scroll hook 입니다. [아래](#Hook)에서 자세히 설명합니다.
- `hook.setScrollContainer
  - div의 ref에 넣으면, 해당 엘리먼트에서 일어나는 스크롤을 감지하여 훅이 작동합니다.
  - `hasScrollContainer` 매개변수를 true로 했을 때만 사용할 수 있습니다.
- `hook.scrollTo`
  - 스크롤 훅을 이용하고 있는 특정 엘리먼트로 스크롤을 이동하는 함수입니다.
  - scroll hook 선언 시 입력할 수 있는 `anchorId` 매개변수에 따라 이동합니다.

```typescript jsx
const initialState = {
  globalState: { someState: false },
  defaultCallback: () => {
  }
}

const useScroll = createGlobalScrollHook(initialState, true);
```




### `createLocalScrollHook`

`createScrollHook`과 비슷하게 작동하지만, useState처럼 한 컴포넌트에 상태가 귀속되는 훅을 반환합니다.

**매개변수**

- `initialState`: 상태의 디폴트값을 정의하는 객체
    - localState: (optional) 상태의 초기값 (상태가 공유되지 않습니다)
    - defaultCallback: (optional) 모든 훅 사용 시에 기본으로 적용할 콜백
    - isHorizontal: (optional) true로 하면 가로 스크롤을 감지
- `hasScrollContainer`: (optional) `window`가 아니라 다른 엘리먼트를 스크롤 컨테이너로 사용할 때 `true`로 전달




### `Hook`

`createGlobalScrollHook`이나 `createLocalScrollHook` 함수가 반환하는 훅입니다.

**매개변수**

- `callback`: 스크롤 진행도에 따라 상태를 변경하는 함수
- `initialState`: 컴포넌트에서 사용할 스크롤 상태값. localScrollHook에서만 사용할 수 있습니다.
- `anchorId`: (optional) scrollTo 사용 시 확인자로 이용할 string. globalScrollHook에서만 사용할 수 있습니다. 


**반환값**

- `targetRef`: 스크롤이 감지될 엘리먼트에게 전달하는 ref입니다.
- `state`: 현재의 스크롤 상태입니다.




### `scroll function`

Hook에서 매개변수로 받는 콜백 함수입니다. 다음과 같은 API들이 자동적으로 매개 변수로 제공되어 콜백 함수 내에서 사용할 수 있습니다.

기본 매개 변수와 별개로, 추가적으로 사용할 수 있는 편의를 위한 도구를 `utility.ts`에 작성하고 있습니다. 현재는 `toggleState`가 존재합니다.

**기본 매개 변수**

- `getState`: 현재 scroll state를 가져옵니다.
- `setState`: scroll state를 변경합니다. scroll state의 일부분(Partial Type)만을 인자로 넣으면 나머지 속성은 유지되고 해당 속성만 변경됩니다. 깊은 비교를 이용하여 변경값이
  없을 경우 리렌더하지 않습니다.
- `progress`: 스크롤되는 컴포넌트가 화면에 얼마나 보이는 지를 나타내는 값입니다. 0 ~ 3 사이의 연속적인 float 값으로 제공됩니다.
    - 0 < progress < 1: 화면 하단에 컴포넌트 일부분이 보임
    - 1 <= progress <= 2: 화면에 컴포넌트 전체가 보임 or 컴포넌트가 화면 전체를 채움
    - 2 < progress < 3: 화면 상단에 컴포넌트 일부분이 보임
    - progress가 0 또는 3: 화면에 컴포넌트가 전혀 보이지 않음

**추가 매개 변수**

- `toggleState(min, max, stateKeyToToggle)`: progress가 최소, 최대 값 사이일 때 세번째 인자로 받은 scrollState key의 값을 true, 아닐 때는 false로
  전환합니다. 선언적인 코드 작성에 유용합니다.




### 사용 예시

```typescript jsx
const { targetRef, state: { available, notFold } } = useScroll({
  callback:
    ({ toggleState }) => {
      toggleState(0.2, 3, "available");
      toggleState(0.7, 3.1, "notFold");
    },
  initialState: { available: false, notFold: false }
});
```

scroll state의 초기값은 `{available:false, notFold:false}`입니다. 스크롤이 내려가기 시작해 progress가 0.2 이상일 때 `available` 속성이 `true`가 되고,
더 내려가 0.7 이상일 때 `notFold` 속성도 `true`가 됩니다. 스크롤이 더 내려가다 화면서 완전히 사라지면 `available`은 다시 `false`가 됩니다. progress의 최대값은 3이기에,
페이지의 스크롤이 컴포넌트를 지나가 있으면 `notFold` 속성은 `false`가 되지 않고 여전히 `true`입니다.


---


## History

### current version

- ver: 1.1.2
- released: 23-05-18
- features
  - 가로 스크롤 모드 추가


### previous versions

- ver: 1.1.1
- released: 23-05-16
- features
  - scrollTo 기능 추가
  - scroll hook 패러미터 입력 방식 변경
  - 초기 상태 반영 안 되는 오류 해결
  - 유틸리티 함수 (toggleScroll) 추가
  - 리드미 오타 수정


- ver: 1.1.0
- released: 23-05-12
- features
    - create scroll hook 형식으로 변경
    - local / global hook 분리


### Upcoming Features
- recordAnchorId 기능 추가
- 더 많은 유틸리티 함수
- 성능 최적화
- position:relative 필요 없게 변경
- jsDoc 최신화
