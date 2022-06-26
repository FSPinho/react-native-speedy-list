
# Speedy List

[![npm](https://img.shields.io/npm/v/react-native-speedy-list?style=flat-square)](https://www.npmjs.com/package/react-native-speedy-list)
[![npm](https://img.shields.io/npm/l/react-native-speedy-list?style=flat-square)](https://www.npmjs.com/package/react-native-speedy-list)
[![npm](https://img.shields.io/npm/dw/react-native-speedy-list?style=flat-square)](https://www.npmjs.com/package/react-native-speedy-list)

A performance-focused component for React Native.

## Purpose

**Speedy List** is a high-performance list component for React Native inspired by the great project [RecyclerListView](https://github.com/Flipkart/recyclerlistview). It relies on the idea that repositioning elements and changing their content is faster than instantiating new elements.

This simple idea along with small tricks creates smoother animations, navigations and dialog openings. 

## How it works

While your list may need to handle 1 million items, the screen shows actually only a few of them. Besides that, these big lists usually have a similar layout for all items, which brings us an interesting possibility: why not only render enough items to fill the screen, and reuse items while scrolling? That's the main purpose of **Speedy List**.

Let's suppose your screen has a height of 1920 pixels, and each list element has a height of 192 pixels, so 20 items would be enough to fit two times the entire screen. Once you start scrolling your list, the first item will be hidden at the top and will be invisible to the user. **Speedy List** will take advantage of it, by repositioning this hidden item at position 21 and changing its content to item 21's content, which is faster than rendering new components every time the screen is scrolled.

Another good improvement is on the first render. Instead of rendering 20 elements at once, **Speedy List** will render these elements in a configurable number of batches, which makes navigations softer. This is especially perceptible on animated list dialogs.

That's it, simple and effective.

## Limitations

At the moment, **Speedy List** can't handle:

* Horizontal scrolling;
* Sticky indexes, excepting the first index;
* Items with zero height.

Also, please note that this is a young project, and still needs a lot of improvements. PRs are welcome.


## Installation

Install **Speedy List** with either yarn or npm:

```yarn add react-native-speedy-list``` or ```npm install --save react-native-speedy-list```

No native setup is needed.

## Usage Example

```TSX  
import { SpeedyList, SpeedyListItemMeta, SpeedyListItemRenderer } from "react-native-speedy-list"

const [items] = useState<Array<User>>([{ id: 0, name: "User 001" }, ...]);  
  
const itemRenderer = useCallback<SpeedyListItemRenderer<User>>(
    ({ item }) => { 
        // Don't use key prop here, since it would kill
        // the recycling purpose.
        return <Text>{item.name}</Text> 
    }, 
    []
)
  
<SpeedyList<User>
    items={items} 
    itemRenderer={itemRenderer} 
    itemHeight={42}
    itemKey={"id"} />  
```  

## Props

| Prop                 | Value Type                  | Default Value                                                                                                                              | Description                                                                                               |  
|----------------------|-----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|  
| items                | `Array<T>`                  | Required*                                                                                                                                  | List entries.                                                                                             |  
| itemRenderer         | `SpeedyListItemRenderer<T>` | Required*                                                                                                                                  | Function to render a list entry.                                                                          |  
| itemHeight           | `number \                   | ((meta: SpeedyListItemMeta<T>) => number)`                                                                                                 | Required*                                                                                                 | Number or function to extract an entry height. |  
| itemKey              | `keyof T \                  | ((meta: SpeedyListItemMeta<T>) => number \                                                                                                 | string)`                                                                                                  | Required* | Property name or function to extract an entry unique key.  |  
| itemEquals           | `(a: T, b: T) => boolean`   | Defaults to a build-in [shallow comparator](https://github.com/FSPinho/react-native-speedy-list/blob/master/src/util/ObjectUtil/index.ts). | Function to compare two entries.                                                                          |
| columns              | `number`                    | `1`                                                                                                                                        | Amount of columns per row.                                                                                  |
| header               | `React.ReactNode`           | `null`                                                                                                                                     | List header component.                                                                                    |
| footer               | `React.ReactNode`           | `null`                                                                                                                                     | List footer component.                                                                                    |
| initialBatchSize     | `number`                    | `8`                                                                                                                                        | First render batch size.                                                                                  |
| recyclableItemsCount | `number`                    | `32`                                                                                                                                       | Amount of recyclable items to render. This should be enough to fill at least two times the screen height. |
| recyclingDelay       | `number`                    | `32`                                                                                                                                       | Interval in milliseconds between list updates.                                                            |
| scrollViewProps      | `ScrollViewProps`           | `null`                                                                                                                                     | Applied to the internal ScrollView component.                                                             |
| headerStyle          | `StyleProp<ViewStyle>`      | `null`                                                                                                                                     | Applied to the header wrapper component.                                                                  |
| footerStyle          | `StyleProp<ViewStyle>`      | `null`                                                                                                                                     | Applied to the footer wrapper component.                                                                  |
| debug                | `boolean`                   | `false`                                                                                                                                    | Enables **Speedy List** debug logs                                                                        |


## Licence

[MIT License](https://github.com/FSPinho/react-native-speedy-list/blob/master/LICENSE)

## Special Thanks

Thanks to [RecyclerListView](https://github.com/Flipkart/recyclerlistview) creator and contributors. And thanks to [kerleysol](https://github.com/kerleysol) and [mardsonferreira](https://github.com/mardsonferreira) for contributing with the list update algorithm.

