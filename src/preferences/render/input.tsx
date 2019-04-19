import React from 'react'

export class Input extends React.Component<Input.Props, Input.State> {
  input: HTMLInputElement

  constructor(props: Input.Props) {
    super(props)
    this.state = {
      value: props.value,
    }
  }

  onFocus = () => {
    this.input.select()
  }

  onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value
    this.props.onChange(value)
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: e.target.value })
  }

  ref = (input: HTMLInputElement) => {
    this.input = input
  }

  render() {
    return (
      <input
        type="text"
        spellCheck={false}
        ref={this.ref}
        onBlur={this.onBlur}
        onFocus={this.onFocus}
        onChange={this.onChange}
        value={this.state.value}
      />
    )
  }
}

export namespace Input {
  export interface Props {
    value: string,
    onChange: (value: string) => void,
  }

  export interface State {
    value: string,
  }
}
