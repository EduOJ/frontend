import VueDraggableResizable from 'vue-draggable-resizable'
import Vue from 'vue'
Vue.component('vue-draggable-resizable', VueDraggableResizable)

export default function (h, props, children, columns, draggingState) {
  let thDom = null
  const { key, ...restProps } = props
  const col = columns.find(col => {
    const k = col.dataIndex
    return k === key
  })
  if (!col.width) {
    return <th {...restProps} class={props.class}>{children}</th>
  }
  const onDrag = (x) => {
    draggingState[key] = 0
    col.width = Math.max(x, 1)
  }
  const onDragStop = () => {
    draggingState[key] = thDom.getBoundingClientRect().width
    col.width = thDom.getBoundingClientRect().width
  }
  return (
    <th class={props.class} {...restProps} v-ant-ref={r => (thDom = r)} width={col.width} style={{ position: 'relative' }}>
      {children}
      <div
        onClick={(e) => e.stopPropagation()}
      >
        <vue-draggable-resizable
          key={col.key}
          className="table-draggable-handle"
          w={10}
          x={draggingState[key] || col.width}
          z={1}
          axis="x"
          draggable={true}
          resizable={false}
          onDragging={onDrag}
          onDragstop={onDragStop}
          style={
            {
              'position': 'absolute',
              'height': '100% !important',
              'bottom': '0',
              'left': '-5px',
              'cursor': 'col-resize',
              'touch-action': 'none'
            }
          }
        >
        </vue-draggable-resizable>
      </div>
    </th>
  )
}
