const getIndicatorColor = (item: any) => {
  if (item.completed) return '#00D2D3';

  switch (item.priority) {
    case 'High':
      return '#FF7675';
    case 'Medium':
      return '#FDCB6E';
    case 'Low':
      return '#00D2D3';
    default:
      return '#56577A';
  }
};