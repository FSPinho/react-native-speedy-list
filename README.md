
# SpeedyList

A performance-focused component for React Native.

### Purpose

SpeedyList is a high-performance list component for React Native inspired by the excellent [RecyclerListView](https://github.com/Flipkart/recyclerlistview). It relies on the idea that repositioning elements and changing their content is faster than instantiating new elements.

### How it works

While your list may need to handle 1 million items, the screen shows actually only a few of them. Besides that, these big lists usually have a similar layout for all items, which brings us an interesting possibility: why not only render enough items to fill the screen, and reuse items while scrolling? That's the main purpose of **SpeedyList**.

Let's suppose your screen has a height of 1920 pixels, and each list element has a height of 190 pixels, so 20 items would be enough to fit two times the entire screen. Once you start scrolling your list, the first item will be hidden at the top and will be invisible to the user. **SpeedyList** will take advantage of it, by repositioning this hidden item at position 21 and changing its content to item 21's content, which is faster than rendering new components every time the screen is scrolled.

Another good improvement is on the first render. Instead of rendering 20 elements at once, SpeedyList will render these elements in a configurable number of batches, which makes navigations softer. This is especially perceptible on animated list dialogs.

That's it, simple and effective.

### Limitations

At the moment, **SpeedyList** can't handle:

* Sticky indexes, excepting the first index.
* Multiple columns.
* Items with zero height.

Also, please note that this is a young project, and still needs a lot of improvements. PRs are welcome.


### Installation

Install **SpeedyList** with either yarn or npm:

```yarn add react-native-speedylist``` or ```npm install --save react-native-speedylist```

No native setup is needed.

### Usage Example

```TSX  
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

### Props

| Prop | Value Type | Default Value | Description |  
|------|------------|---------------|------------|  
| items | `Array<T>` | Required* | List entries. |  
| itemRendered | `SpeedyListItemRenderer<T>` | Required* | Function to render a list entry. |  
| itemHeight | `number | ((meta: SpeedyListItemMeta<T>) => number)` | Required* | Number or function to extract an entry height. |  
| itemKey | `keyof T | ((meta: SpeedyListItemMeta<T>) => number | string)` | Required* | Property name or function to extract an entry unique key.  |  
| itemEquals | `(a: T, b: T) => boolean` | Defaults to an internal shallow comparator. | Function to compare two entries. |
| header | `React.ReactNode` | `null` | List header component. |
| footer | `React.ReactNode` | `null` | List footer component. |
| initialBatchSize | `number` | `8` | First render batch size |
| recyclableItemsCount | `number` | `32` | Amount of recyclable items to render. This should be enough to fill at least two times the screen height. |
| recyclingDelay | `number` | `32` | Interval in milliseconds between list updates. |
|.scrollViewProps | `ScrollViewProps` | `null` | Applied to the internal ScrollView component. |
| headerStyle | `StyleProp<ViewStyle>` | `null` | Applied o the header wrapper component |
| footerStyle | `StyleProp<ViewStyle>` | `null` | Applied o the footer wrapper component |
| debug | `boolean` | `false` | Enables SpeedyList debug logs |


### Licence

[MIT License](https://github.com/FSPinho/react-native-speedy-list/blob/master/LICENSE)

### Special Thanks

Thanks to [RecyclerListView](https://github.com/Flipkart/recyclerlistview) creator and contributors for their great project and inspiration. And thanks to [kerleysol](https://github.com/kerleysol) and [mardsonferreira](https://github.com/mardsonferreira) for contributing with the list update algorithm.

